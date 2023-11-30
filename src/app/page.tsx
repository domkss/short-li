import LongURLInput from "@/components/LongURLInput";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center bg-emerald-100'>
      <NavBar />
      {/*Main URL input layout*/}
      <div className='absolute top-[10%] container max-w-2xl'>
        <div className='p-4 shadow-md bg-gray-400 bg-opacity-20 sm:rounded-md'>
          <h3 className='font-medium text-xl text-center'>Short any long URL for Free</h3>
          <LongURLInput />
        </div>
      </div>
    </main>
  );
}
