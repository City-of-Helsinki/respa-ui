import constants from 'constants/AppConstants';

function getCurrentCustomization() {
  const host = window.location.host;
  return constants.CUSTOMIZATIONS[host] || null;
}

function getCustomizationClassName() {
  switch (getCurrentCustomization()) {

    case 'ESPOO':
      return 'espoo-customizations';

    default:
      return '';
  }
}

export {
  getCurrentCustomization,
  getCustomizationClassName,
};
