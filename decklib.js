
var DeckLib = (function (dlib) {
    dlib.CLUBS = 0;
    dlib.HEARTS = 1;
    dlib.DIAMONDS = 2;
    dlib.SPADES = 3;

    dlib.ACE_MAJOR = 14;
    dlib.ACE_MINOR = 1;
    dlib.KING = 13;
    dlib.QUEEN = 12;
    dlib.JACK = 11;

    /**
     * A card constructor that takes a value and a suit.
     */
    dlib.Card = function(value, suit) {
        this.value = value;
        this.suit = suit;
    };

    /**
     * Tells if the card is an ace.
     */
    dlib.Card.prototype.isAce = function() {
        return this.value == dlib.ACE_MINOR || this.value == dlib.ACE_MAJOR;
    };

    dlib.Card.prototype.compareTo = function(another) {
        if (this.value == another.value)
            return this.suit - another.suit;
        else
            return this.value - another.value;
    };

    /**
     * Given a string value, returns the corresponding suit solely by looking at the
     * first character of the input.
     */
    dlib.str2suit = function(str) {
        str = str.toLowerCase();
        if (str.startsWith("c"))
            return dlib.CLUBS
        else if (str.startsWith("h"))
            return dlib.HEARTS
        else if (str.startsWith("d"))
            return dlib.DIAMONDS;
        else if (str.startsWith("s"))
            return dlib.SPADES;
        throw Error("Invalid suit string: " + str);
    }

    /**
     * Converts a string into a card value.
     */
    dlib.str2value = function(str) {
        str = str.toLowerCase();
        if (str.startsWith("a"))
            return 1;
        else if (str.startsWith("t"))
            return 10;
        else if (str.startsWith("j"))
            return dlib.JACK;
        else if (str.startsWith("q"))
            return dlib.QUEEN;
        else if (str.startsWith("k"))
            return dlib.KING;
        else
            return parseInt(str);
        throw Error("Invalid card value string: " + str);
    }

    /**
     * Given a string in the form <value><suit> (eg AH, 2D, TC)
     * returns the Card object corresponding to it.
     */
    dlib.str2card = function(cardstr) {
        cardstr = cardstr.trim();
        var suit = dlib.str2suit(cardstr[1]);
        var value = dlib.str2value(cardstr[0]);
        return new dlib.Card(value, suit)
    };

    dlib.replaceCardValues = function(cards, oldValue, newValue) {
        cards.forEach(function(card, index) {
            if (card.value == oldValue) {
                card.value = newValue;
            }
        });
    };

    /**
     * Interface definition of all hand builders that take a set of cards
     * (in no particular order) and specific parameters that control
     * the builder process and return a Hand object if the particular
     * hand can be constructed from the given cards, otherwise
     * returns null.
     */
    dlib.HandBuilder = function(cards) {
        return null;
    }

    /**
     * The base class for all hands.
     *
     * All hands must be given a rank that is specific to the 
     * rules of the game being played.
     *
     * Also all hands must provide a builder and compare function
     * given a deck of cards.
     */
    dlib.Hand = function(rank, handType, handData, comparer) {
        this.rank = rank;
        this._handData = handData;
        this._handType = handType;
        this.comparer = comparer;
    };

    /**
     * Returns the type of hand.  This is readonly.
     */
    dlib.Hand.prototype.handType = function() {
        return this._handType;
    }

    /**
     * Hand specific data associated with this hand.
     */
    dlib.Hand.prototype.data = function() {
        return this._handData;
    }

    /**
     * The abstract method to be implemented by the different 
     * child hand classes.
     *
     * Given another hand of the same type, compares the
     * two hands and return:
     *
     *  0 if the two hands result in a draw,
     *  -ve value if the current hand is lesser than the other hand,
     *  +ve value if hte current hand is greater than the other hand.
     */
    dlib.Hand.prototype.compareTo = function(another) {
        if (this.handType() !== another.handType()) {
            throw "This and the other hand are different types.";
        }
        if (typeof(this.comparer) !== "undefined" &&
                    this.comparer != null) {
            return this.comparer(this, another);
        }
        return 0;
    }

    /**
     * Given a list of cards in a hand, ensure all of them
     * are Card instances.
     */
    dlib.normalizeHand = function(cards) {
        return cards.map(function(card, index) {
            return typeof(card) == "string" ?
                    dlib.str2card(card) : card;
        });
    }

    /**
     * Given a set of cards (in a hand) and a list of builders
     * ordered by their rank (highest to lowest), invokes the
     * the first builder that can build a hand given the cards
     * and returns the built hand.
     *
     * If none of the builders can be applied, returns null.
     */
    dlib.buildHand = function(cards, builders) {
        for (var i = 0;i < builders.length;i++) {
            var builder = builders[i];
            var hand = builder(cards);
            if (hand != null) {
                hand.rank = builders.length - i;
                return hand;
            }
        }
        return null;
    };
    return dlib;
}(DeckLib || {}));

