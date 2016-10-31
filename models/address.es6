export default function (sequelize, DataTypes) {
  return sequelize.define( 'address', {
    streetaddress: { type: DataTypes.STRING },
    zipcode: { type: DataTypes.STRING }
  }
)}
