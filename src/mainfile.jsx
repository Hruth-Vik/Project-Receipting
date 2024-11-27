import { useState ,useEffect} from "react";
import "./style1.css";
import axios from "axios";

function App() {
  const [inputProduct, setInputProduct] = useState("");
  const [standardName, setStandardName] = useState("");
  const [isLoading,setIsLoading]=useState(true);
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

  useEffect(()=>{
getMappingData();
  },[])


  const getMappingData=async()=>{
    try{  
      setIsLoading(true);
    const response=await axios.get(`https://receipt-8efa1-default-rtdb.firebaseio.com/test.json`)
    setMappingDict(response.data);
    console.log(response.data.test);
  }catch(error){
    console.log("Error in getMappingData",error);
  }finally{
    setIsLoading(false);
  }
  }




  // Enhanced normalization function
  const normalizeText = (text) => {
    return text.toLowerCase()
      .trim()
      .replace(/[^a-z0-9x\s]/g, '') // Keep alphanumeric and 'x' for dimensions
      .replace(/\s+/g, ' ');
  };

  const putData = async (value) => {
    try{
    const response=await axios.put(`https://receipt-8efa1-default-rtdb.firebaseio.com/test.json`,value)
    console.log(response);
    }catch(error){
      console.log("Error in putData",error);
    }
  };

  // New intelligent matching function
  const findIntelligentMatch = (input) => {
    const normalizedInput = normalizeText(input);
    
    // Check for exact match first
    if (mappingDict[normalizedInput]) {
      return mappingDict[normalizedInput];
    }

    // Split input into keywords
    const inputWords = normalizedInput.split(' ');
    
    // Check each word against dictionary keys
    for (const word of inputWords) {
      if (mappingDict[word]) {
        return mappingDict[word];
      }
    }

    // Check if any dictionary key contains the input
    const matchingKeys = Object.keys(mappingDict).filter(key => 
      key.includes(normalizedInput) || normalizedInput.includes(key)
    );

    if (matchingKeys.length > 0) {
      return mappingDict[matchingKeys[0]];
    }

    return "No match found. Please map manually.";
  };

  // Modified handle input change
  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputProduct(input);
    setSuggestedName(findIntelligentMatch(input));
  };

  // Handle input change for standard name
  const handleStandardNameChange = (e) => {
    setStandardName(e.target.value);
  };

  // Modified add mapping to include variations
  const handleAddMapping = () => {
    const normalizedInput = normalizeText(inputProduct);
    if (normalizedInput && standardName) {
      // Add both full phrase and individual keywords
      const newMappings = {
        ...mappingDict,
        [normalizedInput]: standardName,
      };
      
      // Add individual words as mappings if they're significant
      const words = normalizedInput.split(' ');
      if (words.length > 1) {
        words.forEach(word => {
          if (word.length > 2) { // Only add significant words
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

  if(isLoading){
    return <div>Loading...</div>
  }

  return (
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

      <div className="mapping-dictionary">
        <h2>Mapping Dictionary</h2>
        <ul>
          {Object.entries(mappingDict).map(([key, value], index) => (
            <li key={index}>
              <strong>{key}</strong> → {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
