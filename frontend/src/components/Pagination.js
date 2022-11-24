import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

const Pagination = ({ nPages, currentPage, setCurrentPage, dataLength }) => {
	const pageNumbers = [...Array(nPages + 1).keys()].slice(1);

	const nextPage = () => {
		if (currentPage !== nPages) setCurrentPage(currentPage + 1);
	};
	const prevPage = () => {
		if (currentPage !== 1) setCurrentPage(currentPage - 1);
	};
	return (
		<div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-5'>
			<div className='flex-1 flex justify-between sm:hidden'>
				<div
					className='cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
					onClick={prevPage}
				>
					Previous
				</div>
				<div className='cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
					Next
				</div>
			</div>
			<div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
				<div>
					<p className='text-sm text-gray-700'>
						Showing{' '}
						<span className='font-medium'>{(currentPage - 1) * 5 + 1}</span> to{' '}
						<span className='font-medium'>
							{Math.min(...[currentPage * 5, dataLength])}
						</span>{' '}
						of <span className='font-medium'>{dataLength}</span> results
					</p>
				</div>
				<div>
					<nav
						className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
						aria-label='Pagination'
					>
						<div
							className='cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
							onClick={prevPage}
						>
							<span className='sr-only'>Previous</span>
							<ChevronLeftIcon className='h-5 w-5' aria-hidden='true' />
						</div>
						{/* Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" */}
						{pageNumbers.map((pgNumber) => (
							<div
								key={pgNumber}
								className={`cursor-pointer z-10  border-indigo-500  relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
									currentPage == pgNumber
										? 'bg-indigo-600 text-indigo-50'
										: 'bg-indigo-50 text-indigo-600'
								}`}
								onClick={() => setCurrentPage(pgNumber)}
							>
								{pgNumber}
							</div>
						))}

						<div
							className='cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
							onClick={nextPage}
						>
							<span className='sr-only'>Next</span>
							<ChevronRightIcon className='h-5 w-5' aria-hidden='true' />
						</div>
					</nav>
				</div>
			</div>
		</div>
	);
};

export default Pagination;
