use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZx7r8Xx6YxAo7P5NDfN7");

#[program]
pub mod arbinexus {
    use super::*;

    pub fn initialize_strategy(ctx: Context<InitializeStrategy>, label: String, risk_bps: u16) -> Result<()> {
        require!(label.len() <= 32, ErrorCode::LabelTooLong);
        require!(risk_bps <= 10_000, ErrorCode::RiskOutOfRange);

        let strategy = &mut ctx.accounts.strategy;
        strategy.authority = ctx.accounts.authority.key();
        strategy.label = label;
        strategy.risk_bps = risk_bps;
        strategy.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn update_strategy(ctx: Context<UpdateStrategy>, label: String, risk_bps: u16) -> Result<()> {
        require!(label.len() <= 32, ErrorCode::LabelTooLong);
        require!(risk_bps <= 10_000, ErrorCode::RiskOutOfRange);

        let strategy = &mut ctx.accounts.strategy;
        strategy.label = label;
        strategy.risk_bps = risk_bps;
        strategy.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeStrategy<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + Strategy::INIT_SPACE,
        seeds = [b"strategy", authority.key().as_ref()],
        bump
    )]
    pub strategy: Account<'info, Strategy>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateStrategy<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"strategy", authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub strategy: Account<'info, Strategy>,
}

#[account]
#[derive(InitSpace)]
pub struct Strategy {
    pub authority: Pubkey,
    #[max_len(32)]
    pub label: String,
    pub risk_bps: u16,
    pub updated_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Strategy label exceeds max length")]
    LabelTooLong,
    #[msg("Risk basis points out of range")]
    RiskOutOfRange,
}
