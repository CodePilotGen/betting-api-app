import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase, paramCase } from 'change-case';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack5';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import { useTheme } from '@material-ui/core/styles';
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import axios from '../../utils/axios';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// import { getUserList, deleteUser, getSpecialPermssionList } from '../../redux/slices/user';
// import { getSettingsList } from '../../redux/slices/settings';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SoccerOddsListHead } from '../../components/_dashboard/soccer-odds/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'opened', label: 'Opened', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
  { id: 'league', label: 'League', alignRight: false },
  { id: 'home_team', label: 'Home Team', alignRight: false },
  { id: 'away_team', label: 'Away Team', alignRight: false },
  { id: 'ah_line', label: 'Asian Handicap Line', alignRight: true },
  { id: 'ah_open', label: 'Open', alignRight: true },
  { id: 'ah_home_odds24h', label: '24 hours', alignRight: true },
  { id: 'ah_home_odds8h', label: '8 hours', alignRight: true },
  { id: 'ah_home_odds4h', label: '4 hours', alignRight: true },
  { id: 'ah_home_odds2h', label: '2 hours', alignRight: true },
  { id: 'ah_home_odds30m', label: '30 minutes', alignRight: true },
  { id: 'ah_home_odds_8', label: '08:00', alignRight: true },
  { id: 'ah_home_odds_12', label: '12:00', alignRight: true },
  { id: 'ah_home_odds_15', label: '15:00', alignRight: true }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    array = stabilizedThis.map((el) => el[0]);
    return filter(array, (_user) => {
      if (query.filterName && _user.name.toLowerCase().indexOf(query.filterName.toLowerCase()) === -1) {
        return false;
      }
      if (query.filterEmail && _user.email.toLowerCase().indexOf(query.filterEmail.toLowerCase()) === -1) {
        return false;
      }
      return true;
    });
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function SoccerOddsList() {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  // const { userList, specialPermissionList } = useSelector((state) => state.user);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('soccer_odds_list_rows_per_page')
      ? Number(localStorage.getItem('soccer_odds_list_rows_per_page'))
      : 25
  );
  const matchlist = [];
  // const [handleUserId, setHandleUserId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // useEffect(() => {
  //   dispatch(getUserList());
  //   dispatch(getSpecialPermssionList());
  //   dispatch(getSettingsList());
  // }, [dispatch]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    localStorage.setItem('soccer_odds_list_rows_per_page', parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleFilterByName = (event) => {
  //   setFilterName(event.target.value);
  // };

  // const handleFilterByEmail = (event) => {
  //   setFilterEmail(event.target.value);
  // };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - matchlist.length) : 0;
  // const filteredSoccerOdds = applySortFilter(matchlist, getComparator(order, orderBy), {
  //   filterName,
  //   filterEmail
  // });
  const filteredMatches = [];

  const isOddNotFound = filteredMatches.length === 0;

  return (
    <Page title="Odds: List | Soccer">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Soccer Odds List"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Soccer Odds List' }]}
        />

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <SoccerOddsListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={matchlist.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={matchlist.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
