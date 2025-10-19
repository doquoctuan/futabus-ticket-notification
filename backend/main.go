package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid/v5"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

type Subscription struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID          string    `gorm:"index;not null" json:"user_id"`
	Email           string    `gorm:"not null" json:"email"`
	OriginID        int32     `gorm:"not null" json:"origin_id"`
	OriginCode      string    `gorm:"not null" json:"origin_code"`
	DestinationID   int32     `gorm:"not null" json:"destination_id"`
	DestinationCode string    `gorm:"not null" json:"destination_code"`
	DateTime        time.Time `gorm:"type:timestamptz;not null;column:date_time" json:"date_time"`
	IsActive        bool      `gorm:"default:true" json:"is_active"`
	CreatedAt       int64     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       int64     `gorm:"autoUpdateTime" json:"updated_at"`
	LastCheckedAt   time.Time `gorm:"type:timestamptz;column:last_checked_at" json:"last_checked_at"`
}

// TableName returns the table name for the Subscription model
func (Subscription) TableName() string {
	return "subscriptions"
}

// BeforeCreate hook to generate UUID v7
func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	if s.ID == (uuid.UUID{}) {
		newUUID, err := uuid.NewV7()
		if err != nil {
			return err
		}
		s.ID = newUUID
	}
	return nil
}

func initDB() {
	host := os.Getenv("DATABASE_HOST")
	username := os.Getenv("DATABASE_USERNAME")
	password := os.Getenv("DATABASE_PASSWORD")
	name := os.Getenv("DATABASE_NAME")
	port := os.Getenv("DATABASE_PORT")
	dsn := "host=" + host + " user=" + username + " password=" + password + " dbname=" + name + " port=" + port

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate
	db.AutoMigrate(&Subscription{})

	// Add unique constraint for preventing duplicate active subscriptions
	db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS unique_active_subscription 
		ON subscriptions (user_id, origin_id, destination_id, date_time, is_active) 
		WHERE is_active = true`)
}

func main() {
	initDB()

	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// Routes
	api := r.Group("/api")
	{
		api.POST("/subscriptions", createSubscription)
		api.GET("/subscriptions/:userId", getUserSubscriptions)
		api.PUT("/subscriptions/:id", updateSubscription)
		api.DELETE("/subscriptions/:id", deleteSubscription)
		api.GET("/health", healthCheck)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}

func healthCheck(c *gin.Context) {
	c.JSON(200, gin.H{"status": "healthy"})
}

func createSubscription(c *gin.Context) {
	var subscription Subscription
	if err := c.ShouldBindJSON(&subscription); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Check for existing active subscription with same parameters
	var existing Subscription
	result := db.Where("user_id = ? AND origin_id = ? AND destination_id = ? AND date_time = ? AND is_active = ?",
		subscription.UserID, subscription.OriginID, subscription.DestinationID, subscription.DateTime, true).First(&existing)

	if result.Error == nil {
		c.JSON(409, gin.H{"error": "Active subscription already exists for this route and datetime"})
		return
	}

	if err := db.Create(&subscription).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create subscription"})
		return
	}

	c.JSON(201, subscription)
}

func getUserSubscriptions(c *gin.Context) {
	userId := c.Param("userId")

	var subscriptions []Subscription
	if err := db.Where("user_id = ?", userId).Find(&subscriptions).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}

	c.JSON(200, subscriptions)
}

func updateSubscription(c *gin.Context) {
	id := c.Param("id")

	var subscription Subscription
	if err := db.First(&subscription, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Subscription not found"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// If updating to active status or changing route/datetime, check for conflicts
	if isActive, exists := updates["is_active"]; exists && isActive == true {
		// Get the values that will be used after update
		userID := subscription.UserID
		originID := subscription.OriginID
		destinationID := subscription.DestinationID
		datetime := subscription.DateTime

		if newOriginID, exists := updates["origin_id"]; exists {
			if val, ok := newOriginID.(float64); ok {
				originID = int32(val)
			}
		}
		if newDestinationID, exists := updates["destination_id"]; exists {
			if val, ok := newDestinationID.(float64); ok {
				destinationID = int32(val)
			}
		}
		if newDateTime, exists := updates["date_time"]; exists {
			// Parse the datetime string to time.Time
			if datetimeStr, ok := newDateTime.(string); ok {
				if parsedTime, err := time.Parse(time.RFC3339, datetimeStr); err == nil {
					datetime = parsedTime
				}
			}
		}

		// Check for existing active subscription (excluding current one)
		var existing Subscription
		result := db.Where("user_id = ? AND origin_id = ? AND destination_id = ? AND date_time = ? AND is_active = ? AND id != ?",
			userID, originID, destinationID, datetime, true, subscription.ID).First(&existing)

		if result.Error == nil {
			c.JSON(409, gin.H{"error": "Active subscription already exists for this route and datetime"})
			return
		}
	}

	if err := db.Model(&subscription).Updates(updates).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update subscription"})
		return
	}

	c.JSON(200, subscription)
}

func deleteSubscription(c *gin.Context) {
	id := c.Param("id")

	if err := db.Delete(&Subscription{}, "id = ?", id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete subscription"})
		return
	}

	c.JSON(200, gin.H{"message": "Subscription deleted successfully"})
}
