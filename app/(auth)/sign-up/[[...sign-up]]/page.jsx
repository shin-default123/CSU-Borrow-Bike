import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <section
      className="relative z-10 h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/CSUPhoto.jpg)' }}
      aria-label="Caraga State University background"
    >
      <div className="flex flex-col items-center justify-center h-full">
        <main className="flex items-center justify-center w-full px-8 py-8 sm:px-12 lg:w-3/4 lg:px-16 lg:py-12">
          <div className="max-w-xl lg:max-w-3xl">
            <SignUp />
          </div>
        </main>
      </div>
    </section>
  );
}