import LongURLInput from "@/components/LongURLInput";

export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center bg-emerald-100'>
      {/*Main URL input layout*/}
      <div className='absolute top-1/3 container max-w-2xl'>
        <div className='p-4 shadow-md bg-gray-400 bg-opacity-20 sm:rounded-md'>
          <h3 className='font-medium text-xl text-center'>Short any long URL for Free</h3>
          <LongURLInput />
        </div>
      </div>
    </main>
  );
}
