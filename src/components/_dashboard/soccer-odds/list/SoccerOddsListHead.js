import PropTypes from 'prop-types';
// material
import { visuallyHidden } from '@material-ui/utils';
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel } from '@material-ui/core';

// ----------------------------------------------------------------------

SoccerOddsListHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  headLabel: PropTypes.array,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func
};

export default function SoccerOddsListHead({ order, orderBy, rowCount, headLabel, numSelected, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headGroup) => (
          <TableCell
            key={headGroup.id}
            align={headGroup.alignRight ? 'right' : 'center'}
            colSpan={headGroup.columns.length}
            // style={{ borderWidth: 1, borderColor: '#cdcdcd', borderStyle: 'solid' }}
          >
            {headGroup.label}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        {headLabel.map((headGroup) =>
          headGroup.columns.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.alignRight ? 'right' : 'left'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))
        )}
      </TableRow>
    </TableHead>
  );
}
