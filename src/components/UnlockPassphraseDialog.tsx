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

function UnlockPassphraseDialog({open, onClose, onExited, unlock, reset}: {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
  unlock: (passphrase: string) => Promise<string | null>;
  reset: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleUnlock = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      setErrorMessage("Passphrase is required");
      return;
    }
    const error = await unlock(trimmedValue);
    if (error) {
      setErrorMessage(error);
      return;
    }
    onClose();
  };

  const handleClickShowPassphrase = () => setShowPassphrase(!showPassphrase);

  const preventDefault = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Dialog open={open} slotProps={{transition: {onExited}}}>
      <DialogTitle>Unlock API Key</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{mt: 1, mb: 1}}>
            {errorMessage}
          </Alert>
        )}
        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel htmlFor="outlined-adornment-unlock-passphrase">Passphrase</InputLabel>
          <OutlinedInput
            id="outlined-adornment-unlock-passphrase"
            type={showPassphrase ? "text" : "password"}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUnlock();
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
      </DialogContent>
      <DialogActions>
        <Button onClick={reset}>Reset</Button>
        <Button onClick={handleUnlock} variant="contained">Unlock</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UnlockPassphraseDialog;
