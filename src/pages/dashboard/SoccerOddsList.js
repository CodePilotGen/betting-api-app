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
import { getMatchesList } from '../../redux/slices/matchodds';
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
  {
    id: 'game_info',
    label: 'Game Info',
    alignRight: false,
    columns: [
      { id: 'opened', label: 'Opened', alignRight: false },
      { id: 'time', label: 'Time', alignRight: false },
      { id: 'league', label: 'League', alignRight: false },
      { id: 'home_team', label: 'Home Team', alignRight: false },
      { id: 'away_team', label: 'Away Team', alignRight: false }
    ]
  },
  {
    id: 'home_team_odds',
    label: 'Home Team Odds',
    alignRight: false,
    columns: [
      { id: 'ah_line', label: 'Asian Handicap Line', alignRight: true },
      { id: 'ah_home_open', label: 'Open', alignRight: true },
      { id: 'ah_home_odds24h', label: '24 hours', alignRight: true },
      { id: 'ah_home_odds8h', label: '8 hours', alignRight: true },
      { id: 'ah_home_odds4h', label: '4 hours', alignRight: true },
      { id: 'ah_home_odds2h', label: '2 hours', alignRight: true },
      { id: 'ah_home_odds30m', label: '30 minutes', alignRight: true },
      { id: 'ah_home_odds_8', label: '08:00', alignRight: true },
      { id: 'ah_home_odds_12', label: '12:00', alignRight: true },
      { id: 'ah_home_odds_15', label: '15:00', alignRight: true }
    ]
  },
  {
    id: 'away_team_odds',
    label: 'Away Team Odds',
    alignRight: false,
    columns: [
      { id: 'ah_away_open', label: 'Open', alignRight: true },
      { id: 'ah_away_odds24h', label: '24 hours', alignRight: true },
      { id: 'ah_away_odds8h', label: '8 hours', alignRight: true },
      { id: 'ah_away_odds4h', label: '4 hours', alignRight: true },
      { id: 'ah_away_odds2h', label: '2 hours', alignRight: true },
      { id: 'ah_away_odds30m', label: '30 minutes', alignRight: true },
      { id: 'ah_away_odds_8', label: '08:00', alignRight: true },
      { id: 'ah_away_odds_12', label: '12:00', alignRight: true },
      { id: 'ah_away_odds_15', label: '15:00', alignRight: true }
    ]
  },
  {
    id: 'over_odds',
    label: 'Over Odds',
    alignRight: false,
    columns: [
      { id: 'ou_line', label: 'OU Line', alignRight: true },
      { id: 'ou_over_open', label: 'Open', alignRight: true },
      { id: 'ou_over_odds24h', label: '24 hours', alignRight: true },
      { id: 'ou_over_odds8h', label: '8 hours', alignRight: true },
      { id: 'ou_over_odds4h', label: '4 hours', alignRight: true },
      { id: 'ou_over_odds2h', label: '2 hours', alignRight: true },
      { id: 'ou_over_odds30m', label: '30 minutes', alignRight: true },
      { id: 'ou_over_odds_8', label: '08:00', alignRight: true },
      { id: 'ou_over_odds_12', label: '12:00', alignRight: true },
      { id: 'ou_over_odds_15', label: '15:00', alignRight: true }
    ]
  },
  {
    id: 'under_odds',
    label: 'Away Team Odds',
    alignRight: false,
    columns: [
      { id: 'ou_under_open', label: 'Open', alignRight: true },
      { id: 'ou_under_odds24h', label: '24 hours', alignRight: true },
      { id: 'ou_under_odds8h', label: '8 hours', alignRight: true },
      { id: 'ou_under_odds4h', label: '4 hours', alignRight: true },
      { id: 'ou_under_odds2h', label: '2 hours', alignRight: true },
      { id: 'ou_under_odds30m', label: '30 minutes', alignRight: true },
      { id: 'ou_under_odds_8', label: '08:00', alignRight: true },
      { id: 'ou_under_odds_12', label: '12:00', alignRight: true },
      { id: 'ou_under_odds_15', label: '15:00', alignRight: true }
    ]
  }
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
    return filter(array, (_match) => true);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function SoccerOddsList() {
  const { themeStretch } = useSettings();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { matchesList } = useSelector((state) => state.matchodds);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState(null);
  // const [filterName, setFilterName] = useState('');
  // const [filterEmail, setFilterEmail] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('soccer_odds_list_rows_per_page')
      ? Number(localStorage.getItem('soccer_odds_list_rows_per_page'))
      : 25
  );

  // const [handleUserId, setHandleUserId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    dispatch(getMatchesList());
  }, [dispatch]);

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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - matchesList.length) : 0;
  const filteredMatches = applySortFilter(matchesList, getComparator(order, orderBy));

  const isMatchNotFound = filteredMatches.length === 0;

  return (
    <Page title="Odds: List | Soccer">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Soccer Odds List"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Soccer Odds List' }]}
        />

        <Card>
          <Scrollbar>
            <TableContainer sx={{ maxWidth: 'unset' }}>
              <Table>
                <SoccerOddsListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={matchesList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredMatches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      _id,
                      date,
                      eid,
                      country,
                      sport,
                      league,
                      timezone,
                      day,
                      hour,
                      year,
                      status,
                      match,
                      url,
                      odds,
                      data
                    } = row;

                    const matchDateStr = date.replace(/pm|am/i, '');
                    const _d = data.daylastupdated.split('-');
                    const openDateStr = `${_d[2]}-${_d[1]}-${_d[0]} ${data.timelastupdated}`;
                    const opened = Math.round((new Date(matchDateStr) - new Date(openDateStr)) / 3600000);
                    const ahLine = row.ah_line || (row.ah_odds24h && row.ah_odds24h.handicapValue) || '-';

                    const ahHomeOdds24h =
                      (row.ah_odds24h && row.ah_odds24h.odds && row.ah_odds24h.odds['18'][0]) || '-';
                    const ahHomeOdds8h = (row.ah_odds8h && row.ah_odds8h.odds && row.ah_odds8h.odds['18'][0]) || '-';
                    const ahHomeOdds4h = (row.ah_odds4h && row.ah_odds4h.odds && row.ah_odds4h.odds['18'][0]) || '-';
                    const ahHomeOdds2h = (row.ah_odds2h && row.ah_odds2h.odds && row.ah_odds2h.odds['18'][0]) || '-';
                    const ahHomeOdds30m =
                      (row.ah_odds30m && row.ah_odds30m.odds && row.ah_odds30m.odds['18'][0]) || '-';
                    const ahHomeOdds8 = (row.ah_odds_8 && row.ah_odds_8.odds && row.ah_odds_8.odds['18'][0]) || '-';
                    const ahHomeOdds12 = (row.ah_odds_12 && row.ah_odds_12.odds && row.ah_odds_12.odds['18'][0]) || '-';
                    const ahHomeOdds15 = (row.ah_odds_15 && row.ah_odds_15.odds && row.ah_odds_15.odds['18'][0]) || '-';

                    const ahAwayOdds24h =
                      (row.ah_odds24h && row.ah_odds24h.odds && row.ah_odds24h.odds['18'][1]) || '-';
                    const ahAwayOdds8h = (row.ah_odds8h && row.ah_odds8h.odds && row.ah_odds8h.odds['18'][1]) || '-';
                    const ahAwayOdds4h = (row.ah_odds4h && row.ah_odds4h.odds && row.ah_odds4h.odds['18'][1]) || '-';
                    const ahAwayOdds2h = (row.ah_odds2h && row.ah_odds2h.odds && row.ah_odds2h.odds['18'][1]) || '-';
                    const ahAwayOdds30m =
                      (row.ah_odds30m && row.ah_odds30m.odds && row.ah_odds30m.odds['18'][1]) || '-';
                    const ahAwayOdds8 = (row.ah_odds_8 && row.ah_odds_8.odds && row.ah_odds_8.odds['18'][1]) || '-';
                    const ahAwayOdds12 = (row.ah_odds_12 && row.ah_odds_12.odds && row.ah_odds_12.odds['18'][1]) || '-';
                    const ahAwayOdds15 = (row.ah_odds_15 && row.ah_odds_15.odds && row.ah_odds_15.odds['18'][1]) || '-';

                    const ouLine = row.ou_line || (row.ou_odds24h && row.ou_odds24h.handicapValue) || '-';

                    const ouHomeOdds24h =
                      (row.ou_odds24h && row.ou_odds24h.odds && row.ou_odds24h.odds['18'][0]) || '-';
                    const ouHomeOdds8h = (row.ou_odds8h && row.ou_odds8h.odds && row.ou_odds8h.odds['18'][0]) || '-';
                    const ouHomeOdds4h = (row.ou_odds4h && row.ou_odds4h.odds && row.ou_odds4h.odds['18'][0]) || '-';
                    const ouHomeOdds2h = (row.ou_odds2h && row.ou_odds2h.odds && row.ou_odds2h.odds['18'][0]) || '-';
                    const ouHomeOdds30m =
                      (row.ou_odds30m && row.ou_odds30m.odds && row.ou_odds30m.odds['18'][0]) || '-';
                    const ouHomeOdds8 = (row.ou_odds_8 && row.ou_odds_8.odds && row.ou_odds_8.odds['18'][0]) || '-';
                    const ouHomeOdds12 = (row.ou_odds_12 && row.ou_odds_12.odds && row.ou_odds_12.odds['18'][0]) || '-';
                    const ouHomeOdds15 = (row.ou_odds_15 && row.ou_odds_15.odds && row.ou_odds_15.odds['18'][0]) || '-';

                    const ouAwayOdds24h =
                      (row.ou_odds24h && row.ou_odds24h.odds && row.ou_odds24h.odds['18'][1]) || '-';
                    const ouAwayOdds8h = (row.ou_odds8h && row.ou_odds8h.odds && row.ou_odds8h.odds['18'][1]) || '-';
                    const ouAwayOdds4h = (row.ou_odds4h && row.ou_odds4h.odds && row.ou_odds4h.odds['18'][1]) || '-';
                    const ouAwayOdds2h = (row.ou_odds2h && row.ou_odds2h.odds && row.ou_odds2h.odds['18'][1]) || '-';
                    const ouAwayOdds30m =
                      (row.ou_odds30m && row.ou_odds30m.odds && row.ou_odds30m.odds['18'][1]) || '-';
                    const ouAwayOdds8 = (row.ou_odds_8 && row.ou_odds_8.odds && row.ou_odds_8.odds['18'][1]) || '-';
                    const ouAwayOdds12 = (row.ou_odds_12 && row.ou_odds_12.odds && row.ou_odds_12.odds['18'][1]) || '-';
                    const ouAwayOdds15 = (row.ou_odds_15 && row.ou_odds_15.odds && row.ou_odds_15.odds['18'][1]) || '-';

                    return (
                      <TableRow hover key={_id} tabIndex={-1}>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {opened}
                        </TableCell>
                        <TableCell align="left" style={{ padding: '5' }}>
                          {date}
                        </TableCell>
                        <TableCell align="left" style={{ padding: '5' }}>
                          {league}
                        </TableCell>
                        <TableCell align="left" style={{ padding: '5' }}>
                          {data.local}
                        </TableCell>
                        <TableCell align="left" style={{ padding: '5' }}>
                          {data.away}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahLine}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {odds.local.avg}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds24h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds8h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds4h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds2h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds30m}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds8}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds12}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahHomeOdds15}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {odds.visitor.avg}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds24h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds8h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds4h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds2h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds30m}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds8}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds12}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ahAwayOdds15}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouLine}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {odds.local.avg}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds24h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds8h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds4h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds2h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds30m}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds8}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds12}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouHomeOdds15}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {odds.visitor.avg}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds24h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds8h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds4h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds2h}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds30m}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds8}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds12}
                        </TableCell>
                        <TableCell align="right" style={{ padding: '5' }}>
                          {ouAwayOdds15}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isMatchNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery="Match" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={matchesList.length}
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
