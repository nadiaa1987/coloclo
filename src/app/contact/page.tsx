export default function ContactPage() {
  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions or feedback? We'd love to hear from you.
        </p>
        <div className="mt-8">
          <p className="text-lg">
            You can reach us by email at: <a href="mailto:contact@example.com" className="font-medium text-primary hover:underline">contact@example.com</a>
          </p>
          <p className="mt-2 text-muted-foreground">
            (Please replace this with your actual contact information.)
          </p>
        </div>
      </div>
    </main>
  );
}
