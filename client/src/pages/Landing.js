import main from '../assets/images/main.svg';
import Wrapper from '../assets/wrappers/LandingPage';
import { Logo } from '../components';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <Wrapper>
      <nav>
        <Logo />
      </nav>
      <div className='container page'>
        {/* Info */}
        <div className='info'>
          <h1>
            job <span>tracking</span> app
          </h1>
          <p>
            I'm baby tofu messenger bag fashion axe narwhal glossier pork belly
            meh activated charcoal, asymmetrical swag trust fund heirloom.
            Biodiesel PBR&B slow-carb cronut kickstarter banh mi tousled
            pinterest migas master cleanse pabst forage pug. Pop-up raclette
            offal you probably haven't heard of them, yuccie shaman man bun
            church-key fixie butcher. Coloring book roof party tote bag paleo
            ethical vape tumeric.
          </p>
          <Link to='/register' className='btn btn-hero'>
            Login/Register
          </Link>
        </div>
        <img src={main} alt='job hunt' className='img main-img' />
      </div>
    </Wrapper>
  );
};

export default Landing;
