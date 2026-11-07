// Public Whop identifiers. Sandbox data never charges real money.
const sandbox = import.meta.env.MODE === 'sandbox';
export const merchant = {
  sandbox,
  accountId: import.meta.env.VITE_WHOP_ACCOUNT_ID || (sandbox ? 'biz_QuP6gQdX9pBwCo' : 'biz_NjnUTht6pZas2V'),
  setupConfiguration: sandbox ? 'ch_HUjzRBw33Ees0rX' : 'ch_sWzeEaoE6bPu5qt',
  plans: {
    inspection: import.meta.env.VITE_INSPECTION_PLAN || (sandbox ? 'plan_lnG63qGZ4vjZx' : 'plan_GXyBNE4UfbCLX'),
    deposit: import.meta.env.VITE_DEPOSIT_PLAN || (sandbox ? 'plan_YWhBgfNmWRY01' : 'plan_dCOI1yr7dhmFy'),
    service: import.meta.env.VITE_SERVICE_PLAN || (sandbox ? 'plan_ST7ps55YJ19If' : 'plan_LDV4Gir8Dh5xs'),
  },
};
