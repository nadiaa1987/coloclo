export default function LegalPage() {
  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Legal Information</h1>
        <div className="mt-6 space-y-6 text-lg text-muted-foreground">
          <p>
            This page is intended to host legal information such as your Terms of Service, Privacy Policy, and other legal notices.
          </p>
          <h2 className="text-2xl font-bold text-foreground pt-4">Terms of Service</h2>
          <p>
            Please replace this placeholder text with your own Terms of Service. It's important to outline the rules and guidelines for using your application.
          </p>
          <h2 className="text-2xl font-bold text-foreground pt-4">Privacy Policy</h2>
          <p>
            Please replace this placeholder text with your own Privacy Policy. This should inform users about what data you collect and how you use it.
          </p>
        </div>
      </div>
    </main>
  );
}
