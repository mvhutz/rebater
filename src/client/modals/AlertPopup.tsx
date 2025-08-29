import React from 'react';
import CloseRounded from '@mui/icons-material/CloseRounded';
import Snackbar from '@mui/joy/Snackbar';
import IconButton from '@mui/joy/IconButton';
import { useAppSelector } from '../store/hooks';
import { getLatestMessage, popMessage } from '../store/slices/ui';
import { useDispatch } from 'react-redux';
import ErrorIcon from '@mui/icons-material/Error';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import Typography from '@mui/joy/Typography';

/** ------------------------------------------------------------------------- */

function AlertPopup() {
  const message = useAppSelector(getLatestMessage);
  const [open, setOpen] = React.useState<boolean>(false);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (message == null) return;
    setOpen(true);
  }, [message]);

  const handleUnmount = React.useCallback(() => {
    setOpen(false);
    dispatch(popMessage());
  }, [dispatch]);

  const color = message?.type === "error" ? "danger" : "primary";
  const icon = message?.type === "error" ? <ErrorIcon /> : <InfoOutlineIcon />;
  
  return (
    <Snackbar
      variant="outlined"
      color={color}
      open={open}
      size="sm"
      onClose={handleUnmount}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      startDecorator={icon}
      endDecorator={
        <IconButton onClick={handleUnmount} color={color}>
          <CloseRounded fontSize="small" />
        </IconButton>
      }
    >
      <Typography fontFamily="monospace" textAlign="left">{message?.text}</Typography>
    </Snackbar>
  )
}

/** ------------------------------------------------------------------------- */

export default React.memo(AlertPopup);