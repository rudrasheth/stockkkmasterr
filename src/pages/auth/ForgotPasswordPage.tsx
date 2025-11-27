import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ForgotPasswordPage
 *
 * Flow:
 * 1) Step 1: send OTP to email -> POST /api/forgot-password  (server should send OTP)
 *    Response (dev) may include { debugOtp: "1234" } to allow client-side testing.
 *
 * 2) Step 2: Verify OTP -> If debugOtp exists, verify locally.
 *    Otherwise call POST /api/verify-otp with { email, otp } (recommended production flow).
 *
 * 3) Step 3: Reset password -> POST /api/reset-password { email, newPassword }
 *    On success navigate('/login', { state: { success: 'Password updated...' }})
 */

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null); // store as string for consistency
  const [newPassword, setNewPassword] = useState<string>('');

  // STEP 1: send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your registered email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(`OTP sent to ${email}`);
        // If backend sends back debugOtp for dev, store it as a string.
        if (data?.debugOtp !== undefined) {
          setGeneratedOtp(String(data.debugOtp));
          // optional: show debug OTP in a dev-only toast (remove in prod)
          // toast(`(dev) OTP: ${data.debugOtp}`);
        } else {
          setGeneratedOtp(null);
        }
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('handleSendOtp error', err);
      toast.error('Network error while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.trim();

    if (!entered) {
      toast.error('Please enter the OTP.');
      return;
    }

    // If we have a debug OTP (client-side), compare directly (dev convenience)
    if (generatedOtp) {
      if (entered === String(generatedOtp)) {
        toast.success('OTP verified');
        setStep(3);
      } else {
        toast.error('Invalid OTP. Please check and try again.');
      }
      return;
    }

    // Otherwise, verify with server-side API:
    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: entered }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('OTP verified');
        setStep(3);
      } else {
        toast.error(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      console.error('handleVerifyOtp error', err);
      toast.error('Network error while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Redirect to login and show success message using location.state
        navigate('/login', {
          state: { success: 'Password updated successfully. Please log in.' },
        });
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('handleResetPassword error', err);
      toast.error('Network error while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-gray-600">
            {step === 1 && 'Enter your email to receive a reset code.'}
            {step === 2 && 'Enter the code sent to your email.'}
            {step === 3 && 'Create a new password.'}
          </p>
        </div>

        {/* STEP 1: email */}
        {step === 1 && (
          <form className="space-y-6" onSubmit={handleSendOtp}>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="email"
                className="w-full pl-10 p-3 border rounded-lg"
                required
                placeholder="Registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: otp */}
        {step === 2 && (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={8}
                className="w-full pl-10 p-3 border rounded-lg"
                required
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-gray-600 underline"
                onClick={() => {
                  // resend OTP quickly
                  handleSendOtp(new Event('submit') as unknown as React.FormEvent);
                }}
              >
                Resend OTP
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* STEP 3: new password */}
        {step === 3 && (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                className="w-full pl-10 p-3 border rounded-lg"
                required
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
