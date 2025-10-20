'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

interface Subscription {
    id: string;
    origin_code: string;
    destination_code: string;
    date_time: string;
}

export default function AdminPage() {
    const { user } = useUser();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [selectedSubscription, setSelectedSubscription] = useState('');
    const [formData, setFormData] = useState({
        routeCode: '',
        routeName: '',
        departureStation: '',
        arrivalStation: '',
        departureTime: '',
        arrivalTime: '',
        travelTime: '',
        availableSeats: '30',
        price: '250000',
    });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch('/api/subscriptions');
            if (res.ok) {
                const data = await res.json();
                setSubscriptions(data);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSubscription) {
            alert('Vui lòng chọn thông báo');
            return;
        }

        try {
            const payload = {
                subscription_id: selectedSubscription,
                route_code: formData.routeCode,
                route_name: formData.routeName,
                departure_station: formData.departureStation,
                arrival_station: formData.arrivalStation,
                departure_time: new Date(formData.departureTime).toISOString(),
                arrival_time: new Date(formData.arrivalTime).toISOString(),
                travel_time: formData.travelTime,
                available_seats: parseInt(formData.availableSeats),
                price: parseFloat(formData.price),
            };

            const res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert('Thêm chuyến xe thành công!');
                setFormData({
                    routeCode: '',
                    routeName: '',
                    departureStation: '',
                    arrivalStation: '',
                    departureTime: '',
                    arrivalTime: '',
                    travelTime: '',
                    availableSeats: '30',
                    price: '250000',
                });
            } else {
                alert('Lỗi khi thêm chuyến xe');
            }
        } catch (error) {
            console.error('Failed to create trip:', error);
            alert('Lỗi khi thêm chuyến xe');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Admin - Thêm chuyến xe
                    </h1>
                    <div className="flex items-center gap-4">
                        <a
                            href="/dashboard"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            Về Dashboard
                        </a>
                        <a
                            href="/auth/logout"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            Đăng xuất
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Thêm chuyến xe mới</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chọn thông báo
                            </label>
                            <select
                                value={selectedSubscription}
                                onChange={(e) => setSelectedSubscription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Chọn thông báo</option>
                                {subscriptions.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.origin_code} → {sub.destination_code} ({new Date(sub.date_time).toLocaleDateString('vi-VN')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã tuyến
                                </label>
                                <input
                                    type="text"
                                    value={formData.routeCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, routeCode: e.target.value })
                                    }
                                    placeholder="VD: SGN-HAN"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên tuyến
                                </label>
                                <input
                                    type="text"
                                    value={formData.routeName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, routeName: e.target.value })
                                    }
                                    placeholder="VD: Sài Gòn - Hà Nội"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Điểm đi
                                </label>
                                <input
                                    type="text"
                                    value={formData.departureStation}
                                    onChange={(e) =>
                                        setFormData({ ...formData, departureStation: e.target.value })
                                    }
                                    placeholder="VD: Bến xe Miền Đông"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Điểm đến
                                </label>
                                <input
                                    type="text"
                                    value={formData.arrivalStation}
                                    onChange={(e) =>
                                        setFormData({ ...formData, arrivalStation: e.target.value })
                                    }
                                    placeholder="VD: Bến xe Gia Lâm"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giờ đi
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.departureTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, departureTime: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giờ đến
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.arrivalTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, arrivalTime: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thời gian di chuyển
                                </label>
                                <input
                                    type="text"
                                    value={formData.travelTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, travelTime: e.target.value })
                                    }
                                    placeholder="VD: 12h 30m"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số ghế trống
                                </label>
                                <input
                                    type="number"
                                    value={formData.availableSeats}
                                    onChange={(e) =>
                                        setFormData({ ...formData, availableSeats: e.target.value })
                                    }
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá vé (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    min="0"
                                    step="1000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
                        >
                            Thêm chuyến xe
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
