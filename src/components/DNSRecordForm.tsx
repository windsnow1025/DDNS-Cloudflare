import {useState} from "react";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";

function DNSRecordForm({dnsRecordNames, setDnsRecordNames}: {
  dnsRecordNames: string[];
  setDnsRecordNames: (value: string[]) => void;
}) {
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (trimmed === "" || dnsRecordNames.includes(trimmed)) return;
    setDnsRecordNames([...dnsRecordNames, trimmed]);
    setNewName("");
  };

  const handleRemove = (index: number) => {
    setDnsRecordNames(dnsRecordNames.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-column gap-2">
      <div className="flex-normal gap-2">
        <TextField
          label="DNS Record Name"
          placeholder="sub.example.com"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          size="small"
          sx={{flex: 1}}
        />
        <Button variant="outlined" onClick={handleAdd}>
          Add
        </Button>
      </div>
      {dnsRecordNames.length > 0 && (
        <List dense>
          {dnsRecordNames.map((name, index) => (
            <ListItem
              key={name}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemove(index)}>
                  <DeleteIcon/>
                </IconButton>
              }
            >
              <ListItemText primary={name}/>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}

export default DNSRecordForm;
