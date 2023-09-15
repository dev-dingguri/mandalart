import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import useUser from 'hooks/useUser';
import MainUserPage from 'components/MainUserPage';
import MainGuestPage from 'components/MainGuestPage';
import { useAddLoadingCondition, useIsLoading } from 'contexts/LoadingContext';

const MainPage = () => {
  const { user, isLoading: isUserLoading, error: userError } = useUser();
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
        <CircularProgress size="4rem" thickness={4} sx={{ m: 'auto' }} />
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
