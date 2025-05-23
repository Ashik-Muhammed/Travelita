import React from 'react';
import PropTypes from 'prop-types';
import '../styles/SectionHeader.css';

const SectionHeader = ({ title, subtitle, align = 'center', className = '' }) => {
  return (
    <div className={`section-header ${align} ${className}`}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  className: PropTypes.string,
};

export default SectionHeader;
