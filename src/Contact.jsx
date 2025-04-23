import './Contact.scss';

const Contact = () => {
    return (
        <section id='contact'>
            <div className='contact-container'>
                <div className='contact-header'>
                    <div className='contact-header-mobile-landscape'>
                        <div className='contact-picture'>
                            <img src="contact_carré.png" alt="photo de Ben Bridgen avec une guitare" />
                        </div>

                        <div className='contact-titles'>
                            <div className='contact-title'>
                                <h1>contact</h1>
                            </div>
                            <div className='contact-line'></div>
                            <div className='contact-title-description'>
                                <h5>Cliquez ici pour la version anglaise</h5>
                                <img src="english-logo.png" alt="" />
                            </div>
                        </div>

                    </div>
                </div>
                <div className='contact-main'>
                    <div class="contact-content">
                        <div class="contact-form">
                            <form>
                                <div>
                                    <label for="firstName">Prénom</label>
                                    <input type="text" id="firstName" name="firstName" placeholder="Prénom" required />

                                    <label for="lastName">Nom</label>
                                    <input type="text" id="lastName" name="lastName" placeholder="Nom" required />
                                </div>

                                <div>
                                    <label for="email">Email</label>
                                    <input type="email" id="email" name="email" placeholder="Email" required />

                                    <label for="message">Votre message</label>
                                    <textarea id="message" name="message" rows="4" placeholder="Votre message..." required></textarea>
                                </div>

                                <button type="submit">Envoyer</button>
                            </form>

                            {/* <div class="popup-message">
                                <p class="success-message">Message envoyé avec succès !</p>
                                <p class="error-message">Erreur lors de l'envoi.</p>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
};

export default Contact; 