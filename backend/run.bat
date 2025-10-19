@echo off
if exist .env (
    echo Loading environment variables from .env file...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
            echo Set %%a=%%b
        )
    )
) else (
    echo .env file not found
)

echo Running Go application...
go run main.go