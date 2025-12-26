<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

-- ============================================ -- PRODUCTION FINTECH DATABASE SCHEMA -- Battle-tested in real payment systems -- ============================================ -- ============================================ -- CORE: USERS & AUTHENTICATION -- ============================================ CREATE TABLE users ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(20) UNIQUE, full_name VARCHAR(255) NOT NULL, kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected kyc_verified_at TIMESTAMP, status VARCHAR(20) DEFAULT 'active', -- active, suspended, closed created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); CREATE INDEX idx_users_email ON users(email); CREATE INDEX idx_users_kyc_status ON users(kyc_status); -- ============================================ -- CORE: ACCOUNTS (Chart of Accounts) -- The foundation of double-entry accounting -- ============================================ CREATE TABLE accounts ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), account_type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense account_category VARCHAR(50) NOT NULL, -- user_wallet, system_fee, holding, revenue currency VARCHAR(3) NOT NULL, -- USD, EUR, GBP owner_id UUID, -- NULL for system accounts, user_id for user wallets owner_type VARCHAR(20), -- user, system, merchant status VARCHAR(20) DEFAULT 'active', -- active, frozen, closed metadata JSONB, -- flexible data storage created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ); CREATE INDEX idx_accounts_owner ON accounts(owner_id, owner_type); CREATE INDEX idx_accounts_currency ON accounts(currency); CREATE INDEX idx_accounts_category ON accounts(account_category); -- ============================================ -- CORE: LEDGER (Double-Entry Bookkeeping) -- IMMUTABLE - Never update or delete! -- This is your source of truth -- ============================================ CREATE TABLE ledger_entries ( id BIGSERIAL PRIMARY KEY, entry_group_id UUID NOT NULL, -- links debit/credit pairs account_id UUID NOT NULL, entry_type VARCHAR(10) NOT NULL, -- debit, credit amount DECIMAL(19, 4) NOT NULL CHECK (amount > 0), currency VARCHAR(3) NOT NULL, transaction_id UUID, -- links to business transaction description TEXT, metadata JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES accounts(id) ); -- Critical indexes for performance CREATE INDEX idx_ledger_account ON ledger_entries(account_id, created_at DESC); CREATE INDEX idx_ledger_transaction ON ledger_entries(transaction_id); CREATE INDEX idx_ledger_group ON ledger_entries(entry_group_id); CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC); -- ============================================ -- BUSINESS: TRANSACTIONS -- High-level payment operations -- ============================================ CREATE TABLE transactions ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), idempotency_key VARCHAR(255) UNIQUE, -- prevent duplicate payments transaction_type VARCHAR(50) NOT NULL, -- transfer, deposit, withdrawal, fee from_account_id UUID, to_account_id UUID, amount DECIMAL(19, 4) NOT NULL CHECK (amount > 0), currency VARCHAR(3) NOT NULL, status VARCHAR(20) DEFAULT 'pending', -- pending, authorized, completed, failed, reversed failure_reason TEXT, -- Payment lifecycle states authorized_at TIMESTAMP, captured_at TIMESTAMP, settled_at TIMESTAMP, reversed_at TIMESTAMP, -- Metadata description TEXT, metadata JSONB, -- Timestamps created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_from_account FOREIGN KEY (from_account_id) REFERENCES accounts(id), CONSTRAINT fk_to_account FOREIGN KEY (to_account_id) REFERENCES accounts(id) ); CREATE INDEX idx_tx_idempotency ON transactions(idempotency_key); CREATE INDEX idx_tx_status ON transactions(status, created_at DESC); CREATE INDEX idx_tx_from_account ON transactions(from_account_id, created_at DESC); CREATE INDEX idx_tx_to_account ON transactions(to_account_id, created_at DESC); -- ============================================ -- BUSINESS: TRANSACTION STATE HISTORY -- Audit trail for state changes -- ============================================ CREATE TABLE transaction_state_history ( id BIGSERIAL PRIMARY KEY, transaction_id UUID NOT NULL, from_status VARCHAR(20), to_status VARCHAR(20) NOT NULL, reason TEXT, changed_by UUID, -- user or system created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ); CREATE INDEX idx_tx_history ON transaction_state_history(transaction_id, created_at DESC); -- ============================================ -- COMPLIANCE: LIMITS & VELOCITY CHECKS -- ============================================ CREATE TABLE user_limits ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, limit_type VARCHAR(50) NOT NULL, -- daily_transfer, monthly_deposit, single_transaction currency VARCHAR(3) NOT NULL, limit_amount DECIMAL(19, 4) NOT NULL, period VARCHAR(20) NOT NULL, -- daily, monthly, per_transaction effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP, effective_until TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_user_limit FOREIGN KEY (user_id) REFERENCES users(id) ); CREATE INDEX idx_user_limits ON user_limits(user_id, limit_type); -- ============================================ -- COMPLIANCE: DAILY USAGE TRACKING -- Reset daily for velocity checks -- ============================================ CREATE TABLE daily_usage ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, usage_date DATE NOT NULL DEFAULT CURRENT_DATE, currency VARCHAR(3) NOT NULL, total_sent DECIMAL(19, 4) DEFAULT 0, total_received DECIMAL(19, 4) DEFAULT 0, transaction_count INT DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_user_usage FOREIGN KEY (user_id) REFERENCES users(id), CONSTRAINT unique_daily_usage UNIQUE(user_id, usage_date, currency) ); CREATE INDEX idx_daily_usage ON daily_usage(user_id, usage_date); -- ============================================ -- OPERATIONS: IDEMPOTENCY TRACKING -- Prevent duplicate API requests -- ============================================ CREATE TABLE idempotency_keys ( key VARCHAR(255) PRIMARY KEY, user_id UUID NOT NULL, request_hash VARCHAR(64) NOT NULL, -- SHA256 of request body response_status INT, response_body JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expires_at TIMESTAMP NOT NULL, CONSTRAINT fk_user_idempotency FOREIGN KEY (user_id) REFERENCES users(id) ); CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at); -- ============================================ -- OPERATIONS: SETTLEMENT BATCHES -- Daily/hourly settlement processing -- ============================================ CREATE TABLE settlement_batches ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), batch_date DATE NOT NULL, status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed total_transactions INT DEFAULT 0, total_amount DECIMAL(19, 4) DEFAULT 0, currency VARCHAR(3) NOT NULL, started_at TIMESTAMP, completed_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); CREATE INDEX idx_settlement_date ON settlement_batches(batch_date, status); -- ============================================ -- AUDIT: SYSTEM EVENTS LOG -- Immutable audit trail -- ============================================ CREATE TABLE audit_logs ( id BIGSERIAL PRIMARY KEY, event_type VARCHAR(100) NOT NULL, -- user_login, transaction_created, account_frozen entity_type VARCHAR(50), -- user, transaction, account entity_id UUID, user_id UUID, -- who performed the action ip_address INET, user_agent TEXT, request_data JSONB, response_data JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ); CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC); CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC); CREATE INDEX idx_audit_type ON audit_logs(event_type, created_at DESC); -- ============================================ -- VIEWS: MATERIALIZED BALANCE (Optional) -- For performance, rebuild periodically -- ============================================ CREATE MATERIALIZED VIEW account_balances AS SELECT account_id, currency, SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END) as total_debits, SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END) as total_credits, SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END) as balance, MAX(created_at) as last_updated FROM ledger_entries GROUP BY account_id, currency; CREATE UNIQUE INDEX idx_account_balances ON account_balances(account_id, currency); -- Refresh command: REFRESH MATERIALIZED VIEW CONCURRENTLY account_balances; -- ============================================ -- FUNCTIONS: HELPER QUERIES -- ============================================ -- Calculate real-time balance (always accurate) CREATE OR REPLACE FUNCTION get_account_balance(p_account_id UUID, p_currency VARCHAR) RETURNS DECIMAL(19, 4) AS $$ SELECT COALESCE( SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END), 0 ) FROM ledger_entries WHERE account_id = p_account_id AND currency = p_currency; $$ LANGUAGE SQL STABLE; -- Check if user can transfer amount (velocity check) CREATE OR REPLACE FUNCTION can_user_transfer( p_user_id UUID, p_amount DECIMAL, p_currency VARCHAR ) RETURNS BOOLEAN AS $$ DECLARE v_daily_limit DECIMAL; v_used_today DECIMAL; BEGIN -- Get user's daily limit SELECT limit_amount INTO v_daily_limit FROM user_limits WHERE user_id = p_user_id AND limit_type = 'daily_transfer' AND currency = p_currency AND effective_from <= CURRENT_TIMESTAMP AND (effective_until IS NULL OR effective_until > CURRENT_TIMESTAMP) LIMIT 1; IF v_daily_limit IS NULL THEN RETURN FALSE; -- No limit set END IF; -- Get today's usage SELECT COALESCE(total_sent, 0) INTO v_used_today FROM daily_usage WHERE user_id = p_user_id AND usage_date = CURRENT_DATE AND currency = p_currency; RETURN (v_used_today + p_amount) <= v_daily_limit; END; $$ LANGUAGE plpgsql; -- ============================================ -- SAMPLE DATA: SYSTEM ACCOUNTS -- These are required for operations -- ============================================ -- System Fee Account (collects platform fees) INSERT INTO accounts (account_type, account_category, currency, owner_type, status) VALUES ('revenue', 'system_fee', 'USD', 'system', 'active'); -- System Holding Account (temporary holds during processing) INSERT INTO accounts (account_type, account_category, currency, owner_type, status) VALUES ('asset', 'holding', 'USD', 'system', 'active'); -- System Liability Account (owes to external banks) INSERT INTO accounts (account_type, account_category, currency, owner_type, status) VALUES ('liability', 'bank_reserve', 'USD', 'system', 'active');
