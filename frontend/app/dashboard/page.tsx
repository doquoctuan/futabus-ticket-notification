'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import locationData from '@/data/location_info.json';

interface Trip {
    id: string;
    subscription_id: string;
    route_code: string;
    route_name: string;
    departure_time: string;
    arrival_time: string;
    departure_station: string;
    arrival_station: string;
    travel_time: string;
    available_seats: number;
    price: number;
    created_at: number;
    updated_at: number;
}

interface Subscription {
    id: string;
    origin_code: string;
    destination_code: string;
    date_time: string;
    is_active: boolean;
    trips?: Trip[];
}

interface Location {
    id: number;
    name: string;
    code: string;
    tags: string;
    level: number;
}

// Filter only provinces/cities (level 2)
const cities: Location[] = locationData.filter((loc) => loc.level === 2) as Location[];

export default function Dashboard() {
    const { user } = useUser();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        originId: '',
        originCode: '',
        originName: '',
        destinationId: '',
        destinationCode: '',
        destinationName: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        time: '', // Empty by default
    });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch('/api/subscriptions');

            if (!res.ok) {
                throw new Error('Server error');
            }

            const data = await res.json();
            setSubscriptions(data);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCity = cities.find((city) => city.id.toString() === e.target.value);
        if (selectedCity) {
            setFormData({
                ...formData,
                originId: selectedCity.id.toString(),
                originCode: selectedCity.code,
                originName: selectedCity.name,
            });
        }
    };

    const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCity = cities.find((city) => city.id.toString() === e.target.value);
        if (selectedCity) {
            setFormData({
                ...formData,
                destinationId: selectedCity.id.toString(),
                destinationCode: selectedCity.code,
                destinationName: selectedCity.name,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.originId || !formData.destinationId || !formData.date) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.originId === formData.destinationId) {
            alert('Điểm đi và điểm đến không được trùng nhau');
            return;
        }

        try {
            // Create date in local timezone (not UTC)
            const [year, month, day] = formData.date.split('-').map(Number);
            const [hours, minutes] = formData.time ? formData.time.split(':').map(Number) : [0, 0];
            const dateTime = new Date(year, month - 1, day, hours, minutes, 0);
            
            // Get timezone offset in minutes and convert to ±HH:MM format
            const timezoneOffset = -dateTime.getTimezoneOffset();
            const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
            const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
            const offsetSign = timezoneOffset >= 0 ? '+' : '-';
            const timezoneString = `${offsetSign}${offsetHours}:${offsetMinutes}`;
            
            // Format as ISO 8601 with local timezone
            const isoDate = dateTime.getFullYear() + '-' +
                String(dateTime.getMonth() + 1).padStart(2, '0') + '-' +
                String(dateTime.getDate()).padStart(2, '0') + 'T' +
                String(dateTime.getHours()).padStart(2, '0') + ':' +
                String(dateTime.getMinutes()).padStart(2, '0') + ':' +
                String(dateTime.getSeconds()).padStart(2, '0') + timezoneString;

            const payload = {
                user_id: user?.sub,
                email: user?.email,
                origin_id: parseInt(formData.originId),
                origin_code: formData.originCode,
                origin: formData.originName,
                destination_id: parseInt(formData.destinationId),
                destination_code: formData.destinationCode,
                destination: formData.destinationName,
                date_time: isoDate,
            };

            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // check if response is conflict
            if (res.status === 409) {
                alert('Thông báo với thông tin này đã tồn tại.');
                return;
            }

            if (res.ok) {
                setShowForm(false);
                setFormData({
                    originId: '',
                    originCode: '',
                    originName: '',
                    destinationId: '',
                    destinationCode: '',
                    destinationName: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '',
                });
                fetchSubscriptions();
            }
        } catch (error) {
            console.error('Failed to create subscription:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;

        try {
            await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to delete subscription:', error);
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await fetch(`/api/subscriptions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !isActive }),
            });
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to update subscription:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        FUTA Bus Notification
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">{user?.email}</span>
                        <a
                            href="/auth/logout"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            Đăng xuất
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Thông báo của tôi
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        Thêm thông báo mới
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h3 className="text-lg font-semibold mb-4">Thêm thông báo mới</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Điểm đi
                                    </label>
                                    <select
                                        value={formData.originId}
                                        onChange={handleOriginChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn điểm đi</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Điểm đến
                                    </label>
                                    <select
                                        value={formData.destinationId}
                                        onChange={handleDestinationChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn điểm đến</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày đi
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Giờ đi (tùy chọn)
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) =>
                                            setFormData({ ...formData, time: e.target.value })
                                        }
                                        placeholder="00:00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Các chuyến từ {formData.time || '00:00'} trở đi sẽ được thông báo đến bạn
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                                >
                                    Thêm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4">
                    {subscriptions.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                            Bạn chưa có thông báo nào. Hãy thêm thông báo mới!
                        </div>
                    ) : (
                        subscriptions.map((sub) => (
                            <div
                                key={sub.id}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-lg font-semibold text-gray-800">
                                                {sub.origin_code}
                                            </span>
                                            <span className="text-gray-400">→</span>
                                            <span className="text-lg font-semibold text-gray-800">
                                                {sub.destination_code}
                                            </span>
                                        </div>
                                        <p className="text-gray-600">
                                            Ngày đi: {new Date(sub.date_time).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(sub.id, sub.is_active)}
                                            className={`px-4 py-2 rounded-lg transition ${sub.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {sub.is_active ? 'Đang bật' : 'Đã tắt'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>

                                {/* Trip Details Section */}
                                {sub.trips && sub.trips.length > 0 ? (
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="font-semibold text-gray-700 mb-3">
                                            Chuyến xe tìm thấy ({sub.trips.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {sub.trips.map((trip) => (
                                                <div
                                                    key={trip.id}
                                                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Tuyến đường:</span>{' '}
                                                                {trip.route_name} ({trip.route_code})
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Điểm đi:</span>{' '}
                                                                {trip.departure_station}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Điểm đến:</span>{' '}
                                                                {trip.arrival_station}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Giờ đi:</span>{' '}
                                                                {new Date(trip.departure_time).toLocaleString('vi-VN', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                })}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Giờ đến:</span>{' '}
                                                                {new Date(trip.arrival_time).toLocaleString('vi-VN', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                })}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Thời gian:</span>{' '}
                                                                {trip.travel_time}
                                                            </p>
                                                        </div>
                                                        <div className="md:col-span-2 flex justify-between items-center">
                                                            <div className="flex gap-4">
                                                                <p className="text-sm text-gray-600">
                                                                    <span className="font-medium">Ghế trống:</span>{' '}
                                                                    <span className="text-green-600 font-semibold">
                                                                        {trip.available_seats}
                                                                    </span>
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    <span className="font-medium">Giá vé:</span>{' '}
                                                                    <span className="text-blue-600 font-semibold">
                                                                        {trip.price.toLocaleString('vi-VN')} đ
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 border-t pt-4">
                                        <p className="text-sm text-gray-500 italic">
                                            Chưa tìm thấy chuyến xe phù hợp
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}