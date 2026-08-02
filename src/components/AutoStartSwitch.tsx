import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

function AutoStartSwitch({autoStart, setAutoStart}: {
  autoStart: boolean;
  setAutoStart: (value: boolean) => void;
}) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={autoStart}
          onChange={(e) => setAutoStart(e.target.checked)}
        />
      }
      label="Start when app opens"
    />
  );
}

export default AutoStartSwitch;
