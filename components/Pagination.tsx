/** @format */

"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) => {
  // Only render if there's more than 1 page
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={`flex justify-center items-center gap-6 mt-10 max-md:gap-4 max-md:mt-8 ${className}`}
      role="navigation"
      aria-label="Pagination Navigation">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        aria-disabled={currentPage === 1}
        className="bg-dark-200 text-light-100 px-8 py-3 rounded-lg font-semibold min-w-[120px] hover:bg-dark-200/80 disabled:bg-dark-200/30 disabled:cursor-not-allowed disabled:text-light-200/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background max-md:px-6 max-md:py-2.5 max-md:min-w-[100px] max-md:text-sm">
        Previous
      </button>

      {/* Page Indicator */}
      <span
        className="text-light-100 font-semibold text-base px-4 max-md:text-sm max-md:px-2"
        aria-current="page"
        aria-label={`Page ${currentPage} of ${totalPages}`}>
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        aria-disabled={currentPage === totalPages}
        className="bg-dark-200 text-light-100 px-8 py-3 rounded-lg font-semibold min-w-[120px] hover:bg-dark-200/80 disabled:bg-dark-200/30 disabled:cursor-not-allowed disabled:text-light-200/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background max-md:px-6 max-md:py-2.5 max-md:min-w-[100px] max-md:text-sm">
        Next
      </button>
    </div>
  );
};

export default Pagination;
