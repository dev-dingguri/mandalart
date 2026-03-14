import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import MainUserPage from 'components/MainUserPage';
import MainGuestPage from 'components/MainGuestPage';
import { useAuthStore } from 'stores/useAuthStore';
import { useIsLoading, useAddLoadingCondition } from 'stores/useLoadingStore';

const MainPage = () => {
  const user = useAuthStore((s) => s.user);
  const isUserLoading = useAuthStore((s) => s.isLoading);
  const userError = useAuthStore((s) => s.error);
  const isLoading = useIsLoading();
  useAddLoadingCondition('user', isUserLoading);

  return (
    <>
      <Box
        sx={
          isLoading
            ? {
                display: 'flex',
                height: '100%',
              }
            : { display: 'none' }
        }
      >
        <CircularProgress
          size="4rem"
          thickness={4}
          sx={{ m: 'auto' }}
          color="secondary"
        />
      </Box>
      {user ? (
        <MainUserPage user={user} userError={userError} />
      ) : (
        <MainGuestPage userError={userError} />
      )}
    </>
  );
};

export default MainPage;
