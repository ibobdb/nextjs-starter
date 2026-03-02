'use client';

import { useState } from 'react';
import { authClient, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function TwoFactorAuth() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const is2FAEnabled = (session?.user as { twoFactorEnabled?: boolean })?.twoFactorEnabled || false;

  const handleStartSetup = async () => {
    if (!password) return toast.error('Please enter your password to enable 2FA');
    setLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: password
      });
      if (error) throw new Error(error.message);
      
      if ((data as { totpURI?: string })?.totpURI) {
        setTotpURI((data as { totpURI: string }).totpURI);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode) return toast.error('Please enter the verification code');
    setLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });
      if (error) throw new Error(error.message);
      
      toast.success('Two-Factor Authentication enabled successfully!');
      if ((data as any)?.backupCodes) {
        setBackupCodes((data as any).backupCodes);
        setShowBackupCodes(true);
      }
      setTotpURI(null);
      // Reload to reflect session changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) return toast.error('Please enter your password');
    setLoading(true);
    try {
      const { error } = await authClient.twoFactor.disable({
        password: password
      });
      if (error) throw new Error(error.message);
      toast.success('Two-Factor Authentication disabled.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (isPending) return <div className="flex p-4 justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>;

  if (showBackupCodes) {
    return (
      <div className="space-y-4 p-4 border rounded-xl bg-orange-500/5 border-orange-500/20">
        <h4 className="font-bold text-orange-600">Save Your Backup Codes</h4>
        <p className="text-sm text-muted-foreground">
          Store these backup codes in a secure place. You can use them to access your account if you lose access to your authenticator app.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-xs bg-white p-4 rounded-md border">
          {backupCodes.map((code, i) => (
            <div key={i} className="tracking-widest">{code}</div>
          ))}
        </div>
        <Button onClick={() => setShowBackupCodes(false)} className="w-full mt-4">
          I have saved my backup codes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 border rounded-xl bg-card">
        <div className={`p-3 rounded-full shrink-0 ${is2FAEnabled ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
          {is2FAEnabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold">{is2FAEnabled ? '2FA is currently ENABLED' : '2FA is currently DISABLED'}</h4>
          <p className="text-sm text-muted-foreground">
            {is2FAEnabled 
              ? 'Your account is protected by an additional layer of security.' 
              : 'Protect your account by requiring an authenticator code when signing in.'}
          </p>
          
          {!is2FAEnabled && !totpURI && (
            <div className="mt-4 space-y-4 pt-2 border-t border-border/50">
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="enable-password">Password Confirmation</Label>
                <Input 
                  id="enable-password"
                  type="password" 
                  placeholder="Enter your password to continue" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleStartSetup} disabled={loading || !password} size="sm">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enable 2FA (TOTP)
              </Button>
            </div>
          )}
        </div>
      </div>

      {totpURI && !is2FAEnabled && (
        <div className="p-4 border rounded-xl space-y-4 bg-muted/20">
          <Badge variant="outline" className="mb-2">Setup Instructions</Badge>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm">1. Scan this QR code with your Authenticator App (Google Authenticator, Authy, etc).</p>
              <div className="p-4 bg-white w-fit rounded-lg shadow-sm border mx-auto md:mx-0">
                <QRCodeSVG value={totpURI} size={160} />
              </div>
            </div>
            
            <div className="space-y-4 flex flex-col justify-center">
              <p className="text-sm">2. Enter the 6-digit code generated by the app to confirm setup.</p>
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input 
                  placeholder="000000" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="font-mono text-lg tracking-widest max-w-[200px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleVerifyAndEnable} disabled={loading || verificationCode.length !== 6}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Code
                </Button>
                <Button variant="ghost" onClick={() => setTotpURI(null)} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {is2FAEnabled && (
        <div className="p-4 border border-destructive/20 rounded-xl space-y-4 bg-destructive/5 max-w-md">
          <h4 className="font-semibold text-destructive">Disable 2FA</h4>
          <p className="text-sm text-muted-foreground">
            Disabling 2FA will make your account less secure. Please enter your password to confirm this action.
          </p>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input 
              type="password" 
              placeholder="Confirm password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button variant="destructive" onClick={handleDisable2FA} disabled={loading || !password}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable 2FA
          </Button>
        </div>
      )}
    </div>
  );
}
