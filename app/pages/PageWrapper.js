import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import { Helmet } from 'react-helmet';

const PageWrapper = ({
  children,
  className,
  fluid = false,
  title,
  transparent = false,
}) => {
  return (
    <div className={classNames('app-PageWrapper', { 'app-PageWrapper__transparent': transparent })}>
      <Grid
        className="app-PageWrapper__grid"
        fluid={fluid}
      >
        <Helmet>
          <title>{`${title} - Varaamo`}</title>
        </Helmet>

        <div className={className}>
          {children}
        </div>
      </Grid>
    </div>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fluid: PropTypes.bool,
  title: PropTypes.string.isRequired,
  transparent: PropTypes.bool,
};

export default PageWrapper;
