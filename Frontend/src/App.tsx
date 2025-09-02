import React from "react";
import Routing from "./utils/Routing";

const App: React.FC = () => {
  return (
    <div className="font-[gilroy] flex flex-col justify-between overflow-hidden select-none w-full max-h-screen h-screen">
      <Routing />
    </div>
  );
};

export default App;
