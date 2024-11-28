import { Link } from "react-router-dom";
import "./style2.css"
import PropTypes from 'prop-types';

const MappingDictionary = ({ mappingDict }) => {
  return (
    <div>
      <h1>Mapping Dictionary</h1>
      <ul>
        {Object.entries(mappingDict).map(([key, value], index) => (
          <li key={index}>
            <strong>{key}</strong> → {value}
          </li>
        ))}
      </ul>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

MappingDictionary.propTypes = {
  mappingDict: PropTypes.object.isRequired
};

export default MappingDictionary;
