/**
 * Health Controller
 * AEGIS API — Foundation Health Check
 */

export const getHealth = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "AEGIS API",
    version: "1.0.0"
  });
};
