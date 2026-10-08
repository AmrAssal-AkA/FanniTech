import { Header } from "@/components/Header&Footer/Header";
import { Footer } from "@/components/Header&Footer/Footer";
import { StaffLoginForm } from "@/components/HomePageComponant/StaffLoginForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50/60 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 antialiased">
      <Header />
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <StaffLoginForm />
      </main>
      <Footer />
    </div>
  );
}
