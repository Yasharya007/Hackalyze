function Controls({ handleFilter, handleAddParameters }) {
  // Predefined static parameters
  const parameters = ["Innovation", "Code Quality", "Presentation", "Efficiency", "Scalability"];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4">
      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleFilter}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Show Only Shortlisted
        </button>
        <button
          onClick={handleFilter}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Select Parameter
        </button>
        <button
          onClick={() => handleAddParameters(parameters)}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Add Parameters
        </button>
        <button
          onClick={handleFilter}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Show All Submssion
        </button>
        <button
          onClick={handleFilter}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Show Only Reviewed 
        </button>
        <button
          onClick={handleFilter}
          className="px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700"
        >
          Evaluate
        </button>
      </div>
    </div>
  );
}

export default Controls;
