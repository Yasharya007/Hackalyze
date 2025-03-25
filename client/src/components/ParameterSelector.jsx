import { useState } from "react";
import { addParameterAPI } from "../utils/api.jsx";
import { useSelector } from "react-redux";
function ParameterSelector() {
  const hackathon = useSelector((state) => state.hackathon.selectedHackathon);
  const [parameters, setParameters] = useState([]);
  const [selectedParams, setSelectedParams] = useState({});
  const [weights, setWeights] = useState({});
  const [evaluatedParams, setEvaluatedParams] = useState([]);
  const [newParameter, setNewParameter] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [activeTab, setActiveTab] = useState("All Parameters");

  const handleAddParameter = async () => {
    if (newParameter.trim() !== "" && newDescription.trim() !== ""  && !parameters.includes(newParameter)) {
      addParameterAPI(hackathon._id,newParameter,newDescription)
      .then((res)=>{
        console.log("added param",res)
        setSelectedParams((prev) => ({ ...prev, [newParameter]: false }));
        setWeights((prev) => ({ ...prev, [newParameter]: 0 }));
        setNewParameter("");
        setNewDescription(""); // Reset only in the frontend, not storing
      })
      .catch(()=>{})
    }
  };  
  const handleCheckboxChange = (param) => {
    const isSelected = !selectedParams[param];
    setSelectedParams((prev) => ({ ...prev, [param]: isSelected }));

    if (isSelected) {
      const selectedKeys = Object.keys(selectedParams).filter((key) => selectedParams[key]);
      const newSelected = [...selectedKeys, param];
      const equalWeight = 100 / newSelected.length;
      const newWeights = {};
      newSelected.forEach((p) => {
        newWeights[p] = Math.round(equalWeight);
      });
      setWeights(newWeights);
    } else {
      const remainingKeys = Object.keys(selectedParams).filter((key) => key !== param && selectedParams[key]);
      const remainingWeight = weights[param] || 0;
      const newWeights = { ...weights, [param]: 0 };

      if (remainingKeys.length > 0) {
        const distribute = remainingWeight / remainingKeys.length;
        remainingKeys.forEach((p) => {
          newWeights[p] = Math.round(weights[p] + distribute);
        });
      }
      setWeights(newWeights);
    }
  };

  const handleWeightChange = (param, value) => {
    value = parseInt(value, 10);
    const totalSelected = Object.keys(selectedParams).filter((p) => selectedParams[p]);

    if (totalSelected.length === 1) {
      setWeights({ [param]: 100 });
      return;
    }

    let otherParams = totalSelected.filter((p) => p !== param);
    let remainingWeight = 100 - value;
    let newWeights = { ...weights, [param]: value };

    let sumOthers = otherParams.reduce((sum, p) => sum + weights[p], 0);

    if (sumOthers > 0) {
      otherParams.forEach((p) => {
        newWeights[p] = Math.round((weights[p] / sumOthers) * remainingWeight);
      });
    }

    setWeights(newWeights);
  };
  const handleRemoveParameter = (param) => {
    setParameters((prev) => prev.filter((p) => p !== param));
    setSelectedParams((prev) => {
      const updated = { ...prev };
      delete updated[param];
      return updated;
    });
    setWeights((prev) => {
      const updated = { ...prev };
      delete updated[param];
      return updated;
    });
  };
  
  

  const applyAI = () => {
    const selectedWithWeights = Object.keys(selectedParams).filter((param) => selectedParams[param]);
    setEvaluatedParams(selectedWithWeights);
    console.log("Applying AI on:", selectedWithWeights);
  };

  return (
    <div className="flex flex-col items-center py-6">
      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-4 border-b-2 pb-2">
        {["All Parameters", "Selected Parameters", "Evaluated Parameters"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 ${activeTab === tab ? "border-b-4 border-gray-900 font-bold" : "text-gray-600"}`}
          >
            {tab}
          </button>
          
          
        ))}
      </div>

      {/* Content Sections */}
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-4">
      {activeTab === "All Parameters" && (
  <div>
    <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">All Parameters</h2>
    <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto">
      {parameters.length === 0 ? (
        <p className="text-gray-500 text-center">No parameters added.</p>
      ) : (
        <ul className="list-disc list-inside text-gray-900">
          {parameters.map((param) => (
            <li key={param.name} className="mb-1">
              <strong>{param.name}:</strong> {param.description}
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="flex flex-col gap-2 mt-3">
      <input
        type="text"
        value={newParameter}
        onChange={(e) => setNewParameter(e.target.value)}
        className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
        placeholder="Enter parameter name"
      />
      <input
        type="text"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
        placeholder="Enter description"
      />
      <button onClick={handleAddParameter} className="bg-gray-900 text-white px-3 py-1 rounded-md hover:bg-gray-800">
        Add
      </button>
    </div>
  </div>
)}

        {activeTab === "Selected Parameters" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">Selected Parameters</h2>
            <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto">
            {parameters.length === 0 ? (
              <p className="text-gray-500 text-center">No parameters added.</p>
            ) : (
              parameters.map((param) => (
                <div key={param} className="flex justify-between items-center mb-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedParams[param] || false}
                      onChange={() => handleCheckboxChange(param)}
                      className="cursor-pointer accent-gray-900"
                    />
                    <span className="text-gray-900">{param}</span>
                  </label>
                  {selectedParams[param] && (
                    <div className="flex items-center space-x-2 w-1/2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={weights[param] || 0}
                        onChange={(e) => handleWeightChange(param, e.target.value)}
                        className="w-full accent-gray-900"
                      />
                      <span className="text-gray-900">{weights[param]}%</span>
                    </div>
                  )}
                  <button
          onClick={() => handleRemoveParameter(param)}
          className="ml-2 px-2 py-1 bg-red-900 text-white text-xs rounded hover:bg-red-600"
        >
          Remove
        </button>
                </div>
                
              ))
            )}
          </div>
            <button onClick={applyAI} className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 mt-3">
              Apply AI
            </button>
          </div>
        )}

        {activeTab === "Evaluated Parameters" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">Evaluated Parameters</h2>
            <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto">
              {evaluatedParams.length === 0 ? (
                <p className="text-gray-500 text-center">No evaluated parameters yet.</p>
              ) : (
                <ul className="list-disc list-inside text-gray-900">
                  {evaluatedParams.map((param) => (
                    <li key={param} className="mb-1">{param}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParameterSelector;
