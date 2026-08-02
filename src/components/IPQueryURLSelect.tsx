import {useMemo, useState} from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";

function IPQueryURLSelect({label, defaultURLs, customOptions, onCustomOptionsChange, value, onChange}: {
  label: string;
  defaultURLs: readonly string[];
  customOptions: string[];
  onCustomOptionsChange: (options: string[]) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  const [newUrl, setNewUrl] = useState("");

  const allOptions = useMemo(
    () => [...defaultURLs, ...customOptions],
    [defaultURLs, customOptions]
  );

  const handleAdd = () => {
    const trimmed = newUrl.trim();
    if (trimmed === "" || allOptions.includes(trimmed)) return;
    onCustomOptionsChange([...customOptions, trimmed]);
    setNewUrl("");
  };

  const handleRemove = (url: string) => {
    onCustomOptionsChange(customOptions.filter((o) => o !== url));
    if (value === url) {
      onChange(defaultURLs[0]);
    }
  };

  return (
    <div className="flex-column gap-2">
      <FormControl size="small" fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {allOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="flex-normal gap-2">
        <TextField
          label={`Custom ${label}`}
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          size="small"
          sx={{flex: 1}}
        />
        <Button variant="outlined" onClick={handleAdd}>Add</Button>
      </div>
      {customOptions.length > 0 && (
        <List dense>
          {customOptions.map((option) => (
            <ListItem
              key={option}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemove(option)}>
                  <DeleteIcon/>
                </IconButton>
              }
            >
              <ListItemText primary={option}/>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}

export default IPQueryURLSelect;
