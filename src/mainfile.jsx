import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import MappingDictionary from "./MappingDictionary";
import "./style1.css";
import axios from "axios";

function App() {
  const [inputProduct, setInputProduct] = useState("");
  const [standardName, setStandardName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mappingDict, setMappingDict] = useState({
    "a4": "A4 Paper",
    "a4 paper": "A4 Paper",
    "a4 copy": "A4 Paper",
    "500 sheets": "A4 Paper",
    "sticky": "Sticky Notes",
    "post-it": "Sticky Notes",
    "notes": "Sticky Notes",
    "3x3": "Sticky Notes",
  });
  const [suggestedName, setSuggestedName] = useState("");

  useEffect(() => {
    getMappingData();
  }, []);

  const getMappingData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`https://receipt-8efa1-default-rtdb.firebaseio.com/test.json`);
      setMappingDict(response.data);
      console.log(response.data.test);
    } catch (error) {
      console.log("Error in getMappingData", error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeText = (text) => {
    return text.toLowerCase()
      .trim()
      .replace(/[^a-z0-9x\s]/g, '')
      .replace(/\s+/g, ' ');
  };

  const putData = async (value) => {
    try {
      const response = await axios.put(`https://receipt-8efa1-default-rtdb.firebaseio.com/test.json`, value);
      console.log(response);
    } catch (error) {
      console.log("Error in putData", error);
    }
  };

  const findIntelligentMatch = (input) => {
    const normalizedInput = normalizeText(input);

    if (mappingDict[normalizedInput]) {
      return mappingDict[normalizedInput];
    }

    const inputWords = normalizedInput.split(' ');

    for (const word of inputWords) {
      if (mappingDict[word]) {
        return mappingDict[word];
      }
    }

    const matchingKeys = Object.keys(mappingDict).filter(key =>
      key.includes(normalizedInput) || normalizedInput.includes(key)
    );

    if (matchingKeys.length > 0) {
      return mappingDict[matchingKeys[0]];
    }

    return "No match found. Please map manually.";
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputProduct(input);
    setSuggestedName(findIntelligentMatch(input));
  };

  const handleStandardNameChange = (e) => {
    setStandardName(e.target.value);
  };

  const handleAddMapping = () => {
    const normalizedInput = normalizeText(inputProduct);
    if (normalizedInput && standardName) {
      const newMappings = {
        ...mappingDict,
        [normalizedInput]: standardName,
      };

      const words = normalizedInput.split(' ');
      if (words.length > 1) {
        words.forEach(word => {
          if (word.length > 2) {
            newMappings[word] = standardName;
          }
        });
      }

      setMappingDict(newMappings);
      putData(newMappings);

      alert("Mapping added successfully!");
      setInputProduct("");
      setStandardName("");
      setSuggestedName("");
    } else {
      alert("Please enter both product and standard names.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="App">
            <h1>Product Mapping System</h1>

            <div className="form-container">
              <div>
                <label>Input Product Name:</label>
                <input
                  type="text"
                  value={inputProduct}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label>Suggested Standard Name:</label>
                <input
                  type="text"
                  value={suggestedName}
                  readOnly
                  placeholder="System suggestion"
                />
              </div>

              <div>
                <label>Standard Product Name:</label>
                <input
                  type="text"
                  value={standardName}
                  onChange={handleStandardNameChange}
                  placeholder="Enter standard product name"
                />
              </div>

              <button onClick={handleAddMapping}>Add Mapping</button>
            </div>

            <Link to="/mapping-dictionary">
              <button>View Mapping Dictionary</button>
            </Link>
          </div>
        } />
        <Route path="/mapping-dictionary" element={<MappingDictionary mappingDict={mappingDict} />} />
      </Routes>
    </Router>
  );
}

export default App;
