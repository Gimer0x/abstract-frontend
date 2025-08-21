import { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import './Pricing.css';

const Pricing = () => {
  const { subscription, createCheckoutSession, loading } = useSubscription();

  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '5 documents per month',
        'Short & Medium summaries',
        'Watermarked exports',
        'Limited document history',
      ],
      limitations: [
        'No long summaries',
        'Limited document history',
        'Watermarked exports',
      ],
      buttonText: 'Current Plan',
      buttonDisabled: true,
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      yearlyPrice: '$99.99',
      yearlyPeriod: 'per year\n2 months free!',
      features: [
        '50 documents per month',
        'All summary sizes',
        'All export formats',
        'No watermarks',
        'Full document history',
      ],
      limitations: [],
      buttonText: 'Upgrade to Premium',
      buttonDisabled: false,
      popular: true,
      stripePriceId: 'price_1RocOECQX5MT1PoJlOywlHIc',
      stripeYearlyPriceId: 'price_1RocOECQX5MT1PoJpBZkeGMW',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      yearlyPrice: '$199.99',
      yearlyPeriod: 'per year\n2 months free!',
      features: [
        'Unlimited documents',
        'All summary sizes',
        'All export formats',
        'No watermarks',
        'Full document history',
      ],
      limitations: [],
      buttonText: 'Upgrade to Pro',
      buttonDisabled: false,
      popular: false,
      bestOption: true,
      stripePriceId: 'price_1RocOECQX5MT1PoJEhUFD85P',
      stripeYearlyPriceId: 'price_1RocOECQX5MT1PoJt92UP2Q9',
    },
  ];

  const handleUpgrade = async (plan, isYearly = false) => {
    if (!plan.stripePriceId) return;

    setProcessing(true);
    try {
      const priceId = isYearly ? plan.stripeYearlyPriceId : plan.stripePriceId;
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getCurrentPlan = () => {
    return subscription?.plan || 'free';
  };

  const isCurrentPlan = planId => {
    return getCurrentPlan() === planId;
  };

  if (loading) {
    return (
      <div className='pricing-container'>
        <div className='pricing-loading'>
          <div className='loading-spinner'></div>
          <p>Loading pricing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='pricing-container'>
      <div className='pricing-header'>
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your document summarization needs</p>
      </div>

      <div className='pricing-grid'>
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.bestOption ? 'best-option' : ''} ${isCurrentPlan(plan.id) ? 'current-plan' : ''}`}
          >
            {plan.popular && <div className='popular-badge'>Most Popular</div>}
            {plan.bestOption && (
              <div className='best-option-badge'>
                Best
                <br />
                Option
              </div>
            )}
            {isCurrentPlan(plan.id) && (
              <div className='current-badge'>Current Plan</div>
            )}

            <div className='plan-header'>
              <h2>{plan.name}</h2>
              <div className='price'>
                <span className='amount'>{plan.price}</span>
                <div className='monthly-period'>
                  <span className='period'>Monthly</span>
                </div>
              </div>
              {plan.yearlyPrice && (
                <div className='yearly-price'>
                  <span className='amount'>{plan.yearlyPrice}</span>
                  <span className='period'> Yearly</span>
                  <div className='yearly-period'>
                    <span className='free-months'>2 months free!</span>
                  </div>
                </div>
              )}
            </div>

            <div className='plan-features'>
              <h3>What's included:</h3>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index} className='feature-item'>
                    <span className='checkmark'>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.limitations.length > 0 && (
                <>
                  <h3>Limitations:</h3>
                  <ul>
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className='limitation-item'>
                        <span className='cross'>✗</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className='plan-actions'>
              {isCurrentPlan(plan.id) ? (
                <button className='current-plan-btn' disabled>
                  {plan.buttonText}
                </button>
              ) : (
                <div className='upgrade-options'>
                  <button
                    className='upgrade-btn monthly'
                    onClick={() => handleUpgrade(plan, false)}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Upgrade Monthly'}
                  </button>
                  {plan.yearlyPrice && (
                    <button
                      className='upgrade-btn yearly'
                      onClick={() => handleUpgrade(plan, true)}
                      disabled={processing}
                    >
                      {processing
                        ? 'Processing...'
                        : 'Upgrade Yearly (Save 17%)'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='pricing-footer'>
        <p>
          All plans include secure payment processing via Stripe. change your
          plan at any time.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
