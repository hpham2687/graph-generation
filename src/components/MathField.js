import React, { useEffect, useRef } from "react";

const Mathfield = ({equation, onMathInput}) => {
  const mathFieldRef = useRef(null);

  useEffect(() => {

    // window.mathVirtualKeyboard.layouts = {
    //   rows: [
    //   [
    //   "+", "-", "\\times", "\\frac{#@}{#?}", "=", ".",
    //   "(", ")", "\\sqrt{#0}", "#@^{#?}",
    //   ],
    //   ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    //   ]
    // };
    // const mf = document.getElementById("equation")
    // mf.setOptions({onExport: (mf, latex) => `<math>${latex}</math>`});
    // mathFieldRef.current.<option> = <value>;
  }, []);

  return (
    <math-field id="equation" onInput={onMathInput} ref={mathFieldRef}
    style={{width: 150}}
    >{equation}</math-field>
  );
};
   
export default Mathfield;