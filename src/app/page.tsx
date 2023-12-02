import LongURLInput from "@/components/LongURLInput";

export default function Home() {
  return (
    <main>
      <div className='flex flex-col items-center flex-grow'>
        {/*Main URL input layout*/}
        <div className='absolute sm:top-[15%] max-sm:top-[35%] container max-w-2xl shadow-sm sm:rounded-md'>
          <div className='p-4 shadow-md bg-slate-400 bg-opacity-20 sm:rounded-md'>
            <h3 className='font-medium text-xl text-center'>Short any long URL for Free</h3>
            <LongURLInput />
          </div>
        </div>
      </div>
    </main>
  );
}
