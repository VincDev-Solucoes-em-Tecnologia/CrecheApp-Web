import GroupIcon from '@mui/icons-material/Group';
import ListIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FamilyIcon from '@mui/icons-material/FamilyRestroom';
import BedroomBabyIcon from '@mui/icons-material/BedroomBaby';
import LocationCityIcon from '@mui/icons-material/LocationCity';

// import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

// const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
  },
  {
    title: 'Usuários',
    path: '/users',
    icon: <GroupIcon />,
    // info: (
    //   <Label color="success" variant="inverted">
    //     +1
    //   </Label>
    // ),
  },
  {
    title: 'Crianças',
    path: '/estudantes',
    icon: <FamilyIcon />,
  },
  {
    title: 'Diarios',
    path: '/diarios',
    icon: <ListIcon />,
  },
  {
    title: 'Salas',
    path: '/salas',
    icon: <BedroomBabyIcon />,
  },
  {
    title: 'Cidades',
    path: '/cidades',
    icon: <LocationCityIcon />,
  },
];
