import React from 'react';
import Avatar from '@mui/joy/Avatar';
import { Badge, ColorPaletteProp, DialogContent, DialogTitle, IconButton, Modal, ModalClose, ModalDialog, ModalOverflow, Tooltip } from '@mui/joy';

/** ------------------------------------------------------------------------- */

interface AnalysisAccordionProps {
  children?: React.ReactNode[] | React.ReactNode;
  title: string;
  subtitle: string;
  color: ColorPaletteProp;
  icon: React.ReactNode;
  amount?: number;
  disabled?: boolean
}

function AnalysisAccordion(props: AnalysisAccordionProps) {
  const { children, title, subtitle, icon, color, amount, disabled } = props;
  const [open, setOpen] = React.useState(false);

  const handleToggle = React.useCallback(() => {
    setOpen(o => !o);
  }, []);

  return (
    <>
      <Badge badgeContent={amount} badgeInset={6} size='sm' color={color}>
        <Tooltip title={title} color={color}>
          <IconButton size='lg' color={color} variant={disabled ? "solid" : 'soft'} sx={{ p: 1, borderRadius: 1000 }} disabled={disabled} onClick={handleToggle}>
            <Avatar color={disabled ? "neutral" : color} variant="outlined">{icon}</Avatar>
          </IconButton>
        </Tooltip>
      </Badge>
      <Modal open={open} onClose={handleToggle}>
        <ModalOverflow>
          <ModalDialog maxWidth={600} layout="center">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{subtitle}</DialogContent>
            <ModalClose />
            {children}
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  )
}

/** ------------------------------------------------------------------------- */

export default React.memo(AnalysisAccordion);