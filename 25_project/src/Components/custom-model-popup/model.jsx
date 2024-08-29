export default function Model({ id, header, body, footer, onClose }) {
  return (
    <div id={id || "model"} className="model">
      <div className="model-content"></div>
      <div className="header">
        <span onClick={onClose} className="colse-model-icon">
          *
        </span>
        <h2>{header ? header : "Header"}</h2>
      </div>
      <div className="body">
        {body ? (
          body
        ) : (
          <div>
            <p>This is our model body</p>
          </div>
        )}
      </div>
      <div className="footer">{footer ? footer : <h2>Footer</h2>}</div>
    </div>
  );
}
