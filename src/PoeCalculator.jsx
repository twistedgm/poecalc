import { useState } from "react";

// PoE class wattages (typical)
const POE_CLASSES = {
  "Class 1 (4W)": 4,
  "Class 2 (7W)": 7,
  "Class 3 (15.4W)": 15.4,
  "Class 4 (30W)": 30,
  "Class 5 (45W)": 45,
  "Class 6 (60W)": 60,
  "Class 7 (75W)": 75,
  "Class 8 (90W)": 90,
};

// Example switches (you can expand these)
const SWITCHES = [
  { name: "Cisco C9300-24P", ports: 24, poeBudget: 445 },
  { name: "Cisco C9300-48P", ports: 48, poeBudget: 740 },
  { name: "Netgear GS110TP", ports: 8, poeBudget: 55 },
  { name: "Ubiquiti USW-24-PoE", ports: 24, poeBudget: 200 },
  { name: "Ubiquiti USW-48-PoE", ports: 48, poeBudget: 400 },
];

export default function PoeCalculator() {
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [portClasses, setPortClasses] = useState({});
  const [deviceCounts, setDeviceCounts] = useState({});
  const [mode, setMode] = useState("byPort"); // "byPort" or "byDevice"

  // Total power from port-by-port selection
  const totalPower = Object.values(portClasses).reduce((sum, watts) => sum + watts, 0);

  // Total power from device-count selection
  const deviceTotalPower = Object.entries(deviceCounts).reduce((sum, [cls, count]) => {
    return sum + POE_CLASSES[cls] * (parseInt(count) || 0);
  }, 0);

  // Suggest a switch based on device totals
  const findSuitableSwitch = () => {
    const matches = SWITCHES.filter((s) => s.poeBudget >= deviceTotalPower);
    return matches.length ? matches[0] : null;
  };

  const suggestedSwitch = findSuitableSwitch();

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">PoE Switch Calculator</h1>

      {/* Mode selector */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setMode("byPort")}
          className={`px-4 py-2 rounded ${
            mode === "byPort" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Select Switch → Choose PoE Class Per Port
        </button>
        <button
          onClick={() => setMode("byDevice")}
          className={`px-4 py-2 rounded ${
            mode === "byDevice" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Enter Devices → Get Switch Recommendation
        </button>
      </div>

      {/* ----------------------- MODE 1: SELECT SWITCH & PORT CLASSES --------------------------- */}
      {mode === "byPort" && (
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Select Switch</h2>
          <select
            className="border p-2 rounded w-full mb-6"
            onChange={(e) => {
              const sw = SWITCHES.find((s) => s.name === e.target.value);
              setSelectedSwitch(sw);
              setPortClasses({});
            }}
          >
            <option value="">-- Choose a switch --</option>
            {SWITCHES.map((sw) => (
              <option key={sw.name} value={sw.name}>
                {sw.name} — {sw.ports} ports / {sw.poeBudget}W budget
              </option>
            ))}
          </select>

          {selectedSwitch && (
            <>
              <h2 className="text-xl font-semibold mb-3">2. Assign PoE Class Per Port</h2>

              {Array.from({ length: selectedSwitch.ports }, (_, i) => {
                const port = i + 1;
                return (
                  <div key={port} className="flex items-center gap-4 mb-2">
                    <div className="w-16 font-bold">Port {port}</div>
                    <select
                      className="border p-1 rounded flex-1"
                      onChange={(e) =>
                        setPortClasses({
                          ...portClasses,
                          [port]: POE_CLASSES[e.target.value] || 0,
                        })
                      }
                    >
                      <option value="">None</option>
                      {Object.keys(POE_CLASSES).map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Total Required Power</h3>
                <p className="text-xl">{totalPower.toFixed(1)} W</p>

                {totalPower > selectedSwitch.poeBudget ? (
                  <p className="mt-2 text-red-600 font-semibold">
                    ⚠️ This exceeds the switch’s PoE budget ({selectedSwitch.poeBudget}W)
                  </p>
                ) : (
                  <p className="mt-2 text-green-700 font-semibold">
                    ✓ Within switch PoE budget
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ----------------------- MODE 2: ENTER DEVICES & CALC SWITCH --------------------------- */}
      {mode === "byDevice" && (
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Enter Device Counts</h2>

          {Object.keys(POE_CLASSES).map((cls) => (
            <div key={cls} className="flex items-center gap-4 mb-2">
              <div className="w-40 font-bold">{cls}</div>
              <input
                type="number"
                min="0"
                className="border p-2 rounded w-32"
                onChange={(e) =>
                  setDeviceCounts({
                    ...deviceCounts,
                    [cls]: e.target.value,
                  })
                }
              />
            </div>
          ))}

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Total Power Required</h3>
            <p className="text-2xl">{deviceTotalPower.toFixed(1)} W</p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Recommended Switch</h3>
            {suggestedSwitch ? (
              <p className="text-xl font-semibold text-blue-700">
                {suggestedSwitch.name} ({suggestedSwitch.poeBudget}W budget)
              </p>
            ) : (
              <p className="text-red-600 font-semibold">
                ⚠️ No switch in the list meets this PoE requirement.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
