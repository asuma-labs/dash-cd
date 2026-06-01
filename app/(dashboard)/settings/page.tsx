'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Panggil API update profile
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                updateUser({ email });
                alert('Profile updated!');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
                <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input
                        label="Username"
                        value={user?.username || ''}
                        disabled
                        className="bg-gray-800"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
                <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back.</p>
                <Button variant="danger">Delete Account</Button>
            </div>
        </div>
    );
}
