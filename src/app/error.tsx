'use client';
export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center space-y-2 text-center">
      <h1 className="text-2xl font-semibold">Internal Server Error</h1>
      <p className="text-muted-foreground">
        The page you are looking for could not be found.
      </p>
    </div>
  );
}
