import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <section
      className="relative z-10 bg-cover bg-center bg-no-repeat h-screen"
      style={{ backgroundImage: 'url(/CSUPhoto.jpg)' }}
    >
      <div className="flex flex-col items-center">
        <h2 className="mt-4">
          <img
            src="/RentBike.png"
            alt="Rent Bike"
            className="w-32 h-auto" 
          />
        </h2>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <SignIn />
          </div>
        </main>
      </div>
    </section>
  );
}