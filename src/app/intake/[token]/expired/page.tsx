export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold">This link is no longer valid</h1>
        <p className="text-muted-foreground">Please contact your agency to receive a new intake link.</p>
      </div>
    </div>
  );
}
