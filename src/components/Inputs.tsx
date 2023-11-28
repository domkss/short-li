export default function LongURLInput() {
  return (
    <div className='p-4'>
      <form>
        <div className='relative shadow-xl'>
          <input
            type='url'
            id='url-input'
            className='pr-[110px] block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
            placeholder='example.com/long?url'
            required
          />
          <button
            type='submit'
            className='absolute bottom-2.5 end-2.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
          >
            Short it
          </button>
        </div>
      </form>
    </div>
  );
}
