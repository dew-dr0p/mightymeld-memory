import "animate.css";
import { useEffect, useState } from "react";

export function Tile({ content: Content, flip, state, hint, back: Face }) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (state === "flipped") {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [state]);

  switch (state) {
    case "start":
      return (
        <Back
          className={`inline-block h-16 w-16 bg-indigo-300 rounded-lg p-2 text-indigo-100 text-center ${
            !isFlipped && !hint ? "animate__animated animate__flipInY" : ""
          } ${hint ? "animate__animated animate__tada" : ""}`}
          flip={flip}
        >
          {Face !== null && (
            <Face
              style={{
                display: "inline-block",
                width: "100%",
                height: "100%",
                verticalAlign: "top",
              }}
              className="animate__animated animate__heartBeat"
            />
          )}
        </Back>
      );
    case "flipped":
      return (
        <Front
          className={`inline-block h-16 w-16 bg-indigo-500 text-white p-2 rounded-lg ${
            isFlipped ? "animate__animated animate__flipInY" : ""
          }`}
        >
          <Content
            style={{
              display: "inline-block",
              width: "100%",
              height: "100%",
              verticalAlign: "top",
            }}
          />
        </Front>
      );
    case "matched":
      return (
        <Matched className="inline-block h-16 w-16 text-indigo-200 p-2 animate__animated animate__zoomIn animate__duration_2s">
          <Content
            style={{
              display: "inline-block",
              width: "100%",
              height: "100%",
              verticalAlign: "top",
            }}
          />
        </Matched>
      );
    default:
      throw new Error("Invalid state " + state);
  }
}

function Back({ className, flip, children }) {
  return (
    <div onClick={flip} className={className}>
      {children}
    </div>
  );
}

function Front({ className, children }) {
  return <div className={className}>{children}</div>;
}

function Matched({ className, children }) {
  return <div className={className}>{children}</div>;
}
