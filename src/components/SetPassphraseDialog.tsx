import {type MouseEvent, useState} from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import KeyIcon from "@mui/icons-material/Key";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function SetPassphraseDialog({open, onClose, onExited, setPassphrase}: {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
  setPassphrase: (newPassphrase: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [confirmationValue, setConfirmationValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleSave = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      setErrorMessage("Passphrase is required");
      return;
    }
    if (trimmedValue !== confirmationValue.trim()) {
      setErrorMessage("Passphrases do not match");
      return;
    }
    setPassphrase(trimmedValue);
    onClose();
  };

  const handleClickShowPassphrase = () => setShowPassphrase(!showPassphrase);

  const preventDefault = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Dialog open={open} slotProps={{transition: {onExited}}}>
      <DialogTitle>Set Passphrase</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{mt: 1, mb: 1}}>
            {errorMessage}
          </Alert>
        )}
        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel htmlFor="outlined-adornment-passphrase">Passphrase</InputLabel>
          <OutlinedInput
            id="outlined-adornment-passphrase"
            type={showPassphrase ? "text" : "password"}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            startAdornment={
              <InputAdornment position="start">
                <KeyIcon/>
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassphrase ? "hide the passphrase" : "display the passphrase"}
                  onClick={handleClickShowPassphrase}
                  onMouseDown={preventDefault}
                  onMouseUp={preventDefault}
                  edge="end"
                >
                  {showPassphrase ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                </IconButton>
              </InputAdornment>
            }
            label="Passphrase"
            autoFocus
          />
        </FormControl>
        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel htmlFor="outlined-adornment-confirm-passphrase">Confirm Passphrase</InputLabel>
          <OutlinedInput
            id="outlined-adornment-confirm-passphrase"
            type={showPassphrase ? "text" : "password"}
            value={confirmationValue}
            onChange={(e) => {
              setConfirmationValue(e.target.value);
              setErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            startAdornment={
              <InputAdornment position="start">
                <KeyIcon/>
              </InputAdornment>
            }
            label="Confirm Passphrase"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SetPassphraseDialog;
